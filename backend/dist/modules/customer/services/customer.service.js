import { AppError } from "../../../shared/errors/app.error";
import { SubscriptionLimitService } from "../../subscription";
import { CustomerStatus } from "../constants/customer.constants";
import { CustomerCodeUtil } from "../utils/customer-code.util";
export class CustomerService {
    repository;
    integrations;
    constructor(repository, integrations) {
        this.repository = repository;
        this.integrations = integrations;
    }
    async createCustomer(dto, context) {
        const companyId = this.requireCompany(context);
        await SubscriptionLimitService.assertCanCreateCustomer(companyId);
        const customerCode = CustomerCodeUtil.normalize(dto.customerCode);
        const existing = await this.repository.findCustomerByCode(companyId, customerCode);
        if (existing) {
            throw new AppError("Customer code already exists", 409, "CUSTOMER_CODE_EXISTS");
        }
        if (dto.status === CustomerStatus.Blacklisted && dto.portalEnabled) {
            throw new AppError("Blacklisted customers cannot access customer portal", 422, "CUSTOMER_PORTAL_BLACKLISTED");
        }
        const customer = await this.repository.transaction(async (tx) => tx.createCustomer({
            companyId,
            customerCode,
            customerName: dto.customerName,
            customerType: dto.customerType,
            companyName: dto.companyName ?? null,
            email: dto.email,
            phone: dto.phone ?? null,
            taxNumber: dto.taxNumber ?? null,
            customerGroupId: dto.customerGroupId ?? null,
            paymentTermsId: dto.paymentTermsId ?? null,
            preferredCurrencyCode: dto.preferredCurrencyCode,
            status: dto.status,
            portalEnabled: dto.portalEnabled,
            portalUserId: null,
            metadata: dto.metadata,
            createdBy: context.securityContext.userId ?? null,
            updatedBy: context.securityContext.userId ?? null,
        }));
        await this.audit("customer.create", "customer", customer.id, undefined, customer, context);
        await this.activity("created", "customer", customer.id, { customerCode: customer.customerCode }, context);
        await SubscriptionLimitService.checkCustomerLimit(companyId, context.securityContext.userId ?? undefined);
        return customer;
    }
    async listCustomers(query, context) {
        return this.repository.listCustomers(this.requireCompany(context), query);
    }
    async getCustomer(id, context) {
        const customer = await this.repository.getCustomerProfile(this.requireCompany(context), id);
        if (!customer) {
            throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND");
        }
        this.assertPortalAccess(customer, context);
        return customer;
    }
    async updateCustomer(id, dto, context) {
        const companyId = this.requireCompany(context);
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const before = await this.requireCustomer(companyId, id);
        const nextStatus = dto.status ?? before.status;
        const portalEnabled = dto.portalEnabled ?? before.portalEnabled;
        if (nextStatus === CustomerStatus.Blacklisted && portalEnabled) {
            throw new AppError("Blacklisted customers cannot access customer portal", 422, "CUSTOMER_PORTAL_BLACKLISTED");
        }
        const updated = await this.repository.updateCustomer(companyId, id, {
            ...dto,
            customerCode: dto.customerCode ? CustomerCodeUtil.normalize(dto.customerCode) : undefined,
            companyName: dto.companyName ?? undefined,
            phone: dto.phone ?? undefined,
            taxNumber: dto.taxNumber ?? undefined,
            customerGroupId: dto.customerGroupId ?? undefined,
            paymentTermsId: dto.paymentTermsId ?? undefined,
            updatedBy: context.securityContext.userId ?? null,
        });
        if (!updated) {
            throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND");
        }
        await this.audit(before.status !== updated.status ? "customer.status.change" : "customer.update", "customer", id, before, updated, context);
        await this.activity("updated", "customer", id, { fields: Object.keys(dto) }, context);
        return updated;
    }
    async deleteCustomer(id, context) {
        const companyId = this.requireCompany(context);
        const before = await this.requireCustomer(companyId, id);
        const deleted = await this.repository.transaction(async (tx) => tx.softDeleteCustomer(companyId, id, context.securityContext.userId ?? null));
        if (!deleted) {
            throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND");
        }
        await this.audit("customer.delete", "customer", id, before, deleted, context);
        await this.activity("deleted", "customer", id, undefined, context);
        return deleted;
    }
    async addAddress(customerId, dto, context) {
        const companyId = this.requireCompany(context);
        await this.requireCustomer(companyId, customerId);
        const address = await this.repository.transaction(async (tx) => {
            if (dto.isDefaultBilling) {
                await tx.clearDefaultBillingAddress(companyId, customerId);
            }
            if (dto.isDefaultShipping) {
                await tx.clearDefaultShippingAddress(companyId, customerId);
            }
            return tx.createAddress({
                companyId,
                customerId,
                addressType: dto.addressType,
                contactName: dto.contactName ?? null,
                contactPhone: dto.contactPhone ?? null,
                line1: dto.line1,
                line2: dto.line2 ?? null,
                city: dto.city,
                state: dto.state ?? null,
                postalCode: dto.postalCode,
                country: dto.country.toUpperCase(),
                isDefaultBilling: dto.isDefaultBilling,
                isDefaultShipping: dto.isDefaultShipping,
            });
        });
        await this.activity("address.created", "customer", customerId, { addressId: address.id }, context);
        return address;
    }
    async listAddresses(customerId, context) {
        const companyId = this.requireCompany(context);
        await this.requireCustomer(companyId, customerId);
        return this.repository.listAddresses(companyId, customerId);
    }
    async updateAddress(customerId, addressId, dto, context) {
        const companyId = this.requireCompany(context);
        await this.requireCustomer(companyId, customerId);
        const before = await this.repository.findAddress(companyId, customerId, addressId);
        if (!before) {
            throw new AppError("Customer address not found", 404, "CUSTOMER_ADDRESS_NOT_FOUND");
        }
        const updated = await this.repository.transaction(async (tx) => {
            if (dto.isDefaultBilling) {
                await tx.clearDefaultBillingAddress(companyId, customerId, addressId);
            }
            if (dto.isDefaultShipping) {
                await tx.clearDefaultShippingAddress(companyId, customerId, addressId);
            }
            return tx.updateAddress(companyId, customerId, addressId, {
                ...dto,
                country: dto.country?.toUpperCase(),
            });
        });
        if (!updated) {
            throw new AppError("Customer address not found", 404, "CUSTOMER_ADDRESS_NOT_FOUND");
        }
        await this.activity("address.updated", "customer", customerId, { addressId }, context);
        return updated;
    }
    async deleteAddress(customerId, addressId, context) {
        const companyId = this.requireCompany(context);
        await this.requireCustomer(companyId, customerId);
        const deleted = await this.repository.deleteAddress(companyId, customerId, addressId);
        if (!deleted) {
            throw new AppError("Customer address not found", 404, "CUSTOMER_ADDRESS_NOT_FOUND");
        }
        await this.activity("address.deleted", "customer", customerId, { addressId }, context);
        return deleted;
    }
    async createGroup(dto, context) {
        const group = await this.repository.createGroup({
            companyId: this.requireCompany(context),
            groupCode: CustomerCodeUtil.normalize(dto.groupCode),
            groupName: dto.groupName,
            description: dto.description ?? null,
            isActive: dto.isActive,
        });
        await this.activity("group.created", "customer_group", group.id, { groupCode: group.groupCode }, context);
        return group;
    }
    async listGroups(query, context) {
        return this.repository.listGroups(this.requireCompany(context), query);
    }
    async updateCreditLimit(customerId, dto, context) {
        const companyId = this.requireCompany(context);
        if (Number(dto.creditLimit) < 0) {
            throw new AppError("Credit limit cannot be negative", 422, "CUSTOMER_NEGATIVE_CREDIT_LIMIT");
        }
        const before = await this.requireCustomer(companyId, customerId);
        const result = await this.repository.transaction(async (tx) => {
            await tx.upsertCreditLimit({
                companyId,
                customerId,
                creditLimit: dto.creditLimit,
                creditUsed: "0.00",
                currencyCode: dto.currencyCode,
                effectiveFrom: dto.effectiveFrom,
                effectiveTo: dto.effectiveTo ?? null,
                updatedBy: context.securityContext.userId ?? null,
            });
            return tx.updateCustomer(companyId, customerId, {
                updatedBy: context.securityContext.userId ?? null,
            });
        });
        if (!result) {
            throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND");
        }
        await this.audit("customer.credit_limit.change", "customer", customerId, before, { ...result, creditLimit: dto.creditLimit, reason: dto.reason }, context);
        await this.activity("credit_limit.updated", "customer", customerId, { creditLimit: dto.creditLimit, reason: dto.reason }, context);
        return result;
    }
    async createPricingRule(customerId, dto, context) {
        const companyId = this.requireCompany(context);
        await this.requireCustomer(companyId, customerId);
        const rule = await this.repository.createPricingRule({
            companyId,
            customerId,
            ruleType: dto.ruleType,
            productId: dto.productId ?? null,
            productCategoryId: dto.productCategoryId ?? null,
            minimumQuantity: dto.minimumQuantity,
            discountPercent: dto.discountPercent ?? null,
            fixedPrice: dto.fixedPrice ?? null,
            currencyCode: dto.currencyCode,
            effectiveFrom: dto.effectiveFrom,
            effectiveTo: dto.effectiveTo ?? null,
            isActive: dto.isActive,
            createdBy: context.securityContext.userId ?? null,
        });
        await this.audit("customer.pricing_rule.create", "customer_pricing_rule", rule.id, undefined, rule, context);
        await this.activity("pricing_rule.created", "customer", customerId, { ruleId: rule.id }, context);
        return rule;
    }
    async addNote(customerId, dto, context) {
        const companyId = this.requireCompany(context);
        await this.requireCustomer(companyId, customerId);
        const note = await this.repository.createNote({
            companyId,
            customerId,
            note: dto.note,
            visibility: dto.visibility,
            createdBy: context.securityContext.userId ?? null,
        });
        await this.activity("note.created", "customer", customerId, { noteId: note.id, visibility: note.visibility }, context);
        return note;
    }
    async upsertTaxExemption(customerId, dto, context) {
        const companyId = this.requireCompany(context);
        await this.requireCustomer(companyId, customerId);
        if (dto.expiresAt.getTime() <= Date.now()) {
            throw new AppError("Tax exemption certificate is expired", 422, "CUSTOMER_TAX_EXEMPTION_EXPIRED");
        }
        const exemption = await this.repository.upsertTaxExemption({
            companyId,
            customerId,
            certificateNumber: dto.certificateNumber,
            exemptionType: dto.exemptionType,
            issuingRegion: dto.issuingRegion,
            expiresAt: dto.expiresAt,
            documentUrl: dto.documentUrl ?? null,
            isActive: dto.isActive,
        });
        await this.activity("tax_exemption.upserted", "customer", customerId, { certificateNumber: exemption.certificateNumber }, context);
        return exemption;
    }
    async upsertShippingPreference(customerId, dto, context) {
        const companyId = this.requireCompany(context);
        await this.requireCustomer(companyId, customerId);
        const preference = await this.repository.upsertShippingPreference({
            companyId,
            customerId,
            preferredCarrier: dto.preferredCarrier ?? null,
            serviceLevel: dto.serviceLevel ?? null,
            deliveryInstructions: dto.deliveryInstructions ?? null,
            allowPartialShipments: dto.allowPartialShipments,
            preferredWarehouseId: dto.preferredWarehouseId ?? null,
        });
        await this.activity("shipping_preference.upserted", "customer", customerId, { preferenceId: preference.id }, context);
        return preference;
    }
    async listOrderHistory(customerId, query, context) {
        const companyId = this.requireCompany(context);
        const customer = await this.requireCustomer(companyId, customerId);
        if (customer.status === CustomerStatus.Blocked) {
            await this.activity("order_history.viewed_for_blocked_customer", "customer", customerId, undefined, context);
        }
        return this.repository.listOrderHistory(companyId, customerId, query);
    }
    assertCanPlaceOrder(customer) {
        if (customer.status === CustomerStatus.Blocked || customer.status === CustomerStatus.Blacklisted) {
            throw new AppError("Blocked or blacklisted customers cannot place orders", 422, "CUSTOMER_ORDER_BLOCKED");
        }
    }
    async requireCustomer(companyId, id) {
        const customer = await this.repository.findCustomerById(companyId, id);
        if (!customer) {
            throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND");
        }
        return customer;
    }
    assertPortalAccess(customer, context) {
        const isPortalRequest = context.securityContext.roles.includes("customer_portal");
        if (isPortalRequest && customer.status === CustomerStatus.Blacklisted) {
            throw new AppError("Blacklisted customers cannot access customer portal", 403, "CUSTOMER_PORTAL_BLACKLISTED");
        }
    }
    requireCompany(context) {
        const companyId = context.securityContext.companyId;
        if (!companyId) {
            throw new AppError("Company context required", 403, "COMPANY_CONTEXT_REQUIRED");
        }
        return companyId;
    }
    async audit(action, entityType, entityId, before, after, context) {
        await this.integrations.audit({ action, entityType, entityId, before, after }, context);
    }
    async activity(action, entityType, entityId, metadata, context) {
        await this.integrations.activity({ action, entityType, entityId, metadata }, context);
    }
}
