import { z } from "zod";
const uuid = z.string().uuid();
const optionalUuid = uuid.optional();
const enterpriseType = z.enum(["PARENT_ENTERPRISE", "SUBSIDIARY_ENTERPRISE", "BRANCH_ENTERPRISE"]);
const enterpriseStatus = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
const nullableUuid = uuid.nullable();
const optionalNullableUuid = z.union([uuid, z.null()]).optional();
const code = z.string().trim().min(2).max(40).regex(/^[A-Z0-9_-]+$/i);
const name = z.string().trim().min(2).max(160);
const shortText = z.string().trim().max(200);
const money = z.union([z.string(), z.number()]).transform((value) => String(value));
const transferStatus = z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "IN_TRANSIT", "PENDING_SETTLEMENT", "RECEIVED", "COMPLETED", "REJECTED", "CANCELLED"]);
const transferType = z.enum(["STOCK_TRANSFER", "STOCK_RETURN"]);
const priority = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);
export class EnterpriseValidator {
    static idParams = z.object({
        enterpriseId: uuid,
    });
    static companyParams = z.object({
        enterpriseId: uuid,
        companyId: uuid,
    });
    static userParams = z.object({
        enterpriseId: uuid,
        userId: uuid,
    });
    static transferParams = z.object({
        enterpriseId: uuid,
        transferId: uuid,
    });
    static transferListQuery = z.object({
        tab: z.enum(["ALL", "PENDING_APPROVAL", "IN_TRANSIT", "PENDING_SETTLEMENT", "COMPLETED", "CANCELLED"]).optional(),
        search: z.string().trim().max(160).optional(),
        status: transferStatus.optional(),
        transferType: transferType.optional(),
        sourceEnterpriseId: uuid.optional(),
        destinationEnterpriseId: uuid.optional(),
        dateFrom: z.string().trim().max(40).optional(),
        dateTo: z.string().trim().max(40).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
    });
    static documentParams = z.object({
        enterpriseId: uuid,
        documentId: uuid,
    });
    static settingParams = z.object({
        enterpriseId: uuid,
        settingKey: z.string().trim().min(1).max(120),
    });
    static listQuery = z.object({
        search: z.string().trim().max(120).optional(),
        enterpriseType: enterpriseType.optional(),
        status: enterpriseStatus.optional(),
        country: z.string().trim().max(80).optional(),
        parentEnterpriseId: uuid.optional(),
        createdFrom: z.string().trim().max(40).optional(),
        createdTo: z.string().trim().max(40).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
    });
    static hierarchyQuery = z.object({
        parentEnterpriseId: z.union([uuid, z.literal("root")]).optional(),
        mode: z.enum(["full", "children"]).optional(),
    });
    static createEnterprise = z.object({
        enterprise_code: code,
        enterprise_name: name,
        enterprise_type: enterpriseType,
        parent_enterprise_id: optionalUuid,
        description: z.string().trim().max(1000).optional(),
        legal_name: shortText.optional(),
        tax_id: z.string().trim().max(80).optional(),
        country: z.string().trim().max(80).optional(),
        state: z.string().trim().max(80).optional(),
        city: z.string().trim().max(80).optional(),
        postal_code: z.string().trim().max(40).optional(),
        address: z.string().trim().max(500).optional(),
        timezone: z.string().trim().max(80).optional(),
        currency: z.string().trim().length(3).toUpperCase().optional(),
        status: enterpriseStatus.optional(),
    }).refine((value) => value.enterprise_type === "PARENT_ENTERPRISE" || Boolean(value.parent_enterprise_id), {
        message: "Parent enterprise is required for subsidiary or branch enterprise",
        path: ["parent_enterprise_id"],
    }).transform((value) => ({
        enterpriseCode: value.enterprise_code,
        enterpriseName: value.enterprise_name,
        enterpriseType: value.enterprise_type,
        parentEnterpriseId: value.parent_enterprise_id,
        description: value.description,
        legalName: value.legal_name,
        taxId: value.tax_id,
        country: value.country,
        state: value.state,
        city: value.city,
        postalCode: value.postal_code,
        address: value.address,
        timezone: value.timezone,
        currency: value.currency,
        status: value.status,
    }));
    static updateEnterprise = z.object({
        enterprise_code: code.optional(),
        enterprise_name: name.optional(),
        enterprise_type: enterpriseType.optional(),
        parent_enterprise_id: optionalNullableUuid,
        description: z.string().trim().max(1000).optional(),
        legal_name: shortText.optional(),
        tax_id: z.string().trim().max(80).optional(),
        country: z.string().trim().max(80).optional(),
        state: z.string().trim().max(80).optional(),
        city: z.string().trim().max(80).optional(),
        postal_code: z.string().trim().max(40).optional(),
        address: z.string().trim().max(500).optional(),
        timezone: z.string().trim().max(80).optional(),
        currency: z.string().trim().length(3).toUpperCase().optional(),
        status: enterpriseStatus.optional(),
    }).refine((value) => Object.keys(value).length > 0, {
        message: "At least one field is required",
    }).transform((value) => ({
        enterpriseCode: value.enterprise_code,
        enterpriseName: value.enterprise_name,
        enterpriseType: value.enterprise_type,
        parentEnterpriseId: value.parent_enterprise_id,
        description: value.description,
        legalName: value.legal_name,
        taxId: value.tax_id,
        country: value.country,
        state: value.state,
        city: value.city,
        postalCode: value.postal_code,
        address: value.address,
        timezone: value.timezone,
        currency: value.currency,
        status: value.status,
    }));
    static moveEnterprise = z.object({
        parent_enterprise_id: nullableUuid,
    }).transform((value) => ({
        parentEnterpriseId: value.parent_enterprise_id,
    }));
    static configurationSettings = z.object({
        settings: z.array(z.object({
            section: z.string().trim().min(1).max(80),
            key: z.string().trim().min(1).max(120),
            value: z.unknown().optional(),
            override_allowed: z.boolean().optional(),
            override_status: z.enum(["INHERITED", "OVERRIDDEN", "UNCONFIGURED"]).optional(),
            source_enterprise_id: optionalNullableUuid,
        })).min(1).max(100),
    }).transform((value) => ({
        settings: value.settings.map((setting) => ({
            section: setting.section,
            key: setting.key,
            value: setting.value,
            overrideAllowed: setting.override_allowed,
            overrideStatus: setting.override_status,
            sourceEnterpriseId: setting.source_enterprise_id,
        })),
    }));
    static copyConfiguration = z.object({
        source_enterprise_id: uuid,
    }).transform((value) => ({
        sourceEnterpriseId: value.source_enterprise_id,
    }));
    static addDocument = z.object({
        document_name: z.string().trim().min(1).max(200),
        category: z.string().trim().min(1).max(80),
        status: z.string().trim().min(1).max(40).optional(),
        version: z.coerce.number().int().min(1).optional(),
        file_key: z.string().trim().max(500).optional(),
        file_url: z.string().trim().max(1000).optional(),
    }).transform((value) => ({
        documentName: value.document_name,
        category: value.category,
        status: value.status,
        version: value.version,
        fileKey: value.file_key,
        fileUrl: value.file_url,
    }));
    static addCompany = z.object({
        companyId: uuid,
    });
    static addUser = z.object({
        userId: uuid,
        role: z.enum(["OWNER", "ADMIN", "ANALYST", "VIEWER"]),
    });
    static createTransfer = z.object({
        source_enterprise_id: uuid,
        destination_enterprise_id: uuid,
        source_company_id: optionalUuid,
        destination_company_id: optionalUuid,
        source_organization_id: optionalUuid,
        destination_organization_id: optionalUuid,
        source_warehouse_id: optionalUuid,
        destination_warehouse_id: optionalUuid,
        transfer_number: z.string().trim().min(3).max(80).optional(),
        reference_number: z.string().trim().min(3).max(80).optional(),
        transfer_type: transferType,
        transfer_date: z.string().trim().min(1).max(40),
        planned_ship_date: z.string().trim().max(40).optional(),
        expected_delivery_date: z.string().trim().max(40).optional(),
        priority,
        reason: z.string().trim().min(2).max(120),
        shipping_method: z.string().trim().max(80).optional(),
        carrier: z.string().trim().max(80).optional(),
        tracking_number: z.string().trim().max(120).optional(),
        special_instructions: z.string().trim().max(500).optional(),
        internal_notes: z.string().trim().max(500).optional(),
        settlement_method: z.string().trim().min(2).max(80),
        billing_enterprise_id: uuid,
        currency: z.string().trim().length(3).toUpperCase(),
        tax_handling: z.string().trim().max(80).optional(),
        invoice_generation: z.string().trim().max(80).optional(),
        approval_note: z.string().trim().max(500).optional(),
        business_justification: z.string().trim().max(500).optional(),
        risk_acknowledged: z.boolean().optional(),
        policy_acknowledged: z.boolean().optional(),
        status: transferStatus.optional(),
        items: z.array(z.object({
            product_id: optionalUuid,
            product_sku: z.string().trim().min(1).max(80),
            product_name: z.string().trim().min(1).max(200),
            product_category: z.string().trim().max(120).optional(),
            product_image_url: z.string().trim().max(1000).optional(),
            available_stock: money,
            transfer_quantity: money,
            uom: z.string().trim().min(1).max(40),
            unit_cost: money,
        })).min(1).max(200),
        attachments: z.array(z.object({
            file_name: z.string().trim().min(1).max(240),
            file_type: z.string().trim().max(80).optional(),
            file_size: z.string().trim().max(80).optional(),
            file_key: z.string().trim().max(500).optional(),
            file_url: z.string().trim().max(1000).optional(),
        })).max(20).optional(),
    }).refine((value) => value.source_enterprise_id !== value.destination_enterprise_id, {
        message: "Source and destination enterprises must differ",
        path: ["destination_enterprise_id"],
    }).transform((value) => ({
        sourceEnterpriseId: value.source_enterprise_id,
        destinationEnterpriseId: value.destination_enterprise_id,
        sourceCompanyId: value.source_company_id,
        destinationCompanyId: value.destination_company_id,
        sourceOrganizationId: value.source_organization_id,
        destinationOrganizationId: value.destination_organization_id,
        sourceWarehouseId: value.source_warehouse_id,
        destinationWarehouseId: value.destination_warehouse_id,
        transferNumber: value.transfer_number,
        referenceNumber: value.reference_number,
        transferType: value.transfer_type,
        transferDate: value.transfer_date,
        plannedShipDate: value.planned_ship_date,
        expectedDeliveryDate: value.expected_delivery_date,
        priority: value.priority,
        reason: value.reason,
        shippingMethod: value.shipping_method,
        carrier: value.carrier,
        trackingNumber: value.tracking_number,
        specialInstructions: value.special_instructions,
        internalNotes: value.internal_notes,
        settlementMethod: value.settlement_method,
        billingEnterpriseId: value.billing_enterprise_id,
        currency: value.currency,
        taxHandling: value.tax_handling,
        invoiceGeneration: value.invoice_generation,
        approvalNote: value.approval_note,
        businessJustification: value.business_justification,
        riskAcknowledged: value.risk_acknowledged,
        policyAcknowledged: value.policy_acknowledged,
        status: value.status,
        items: value.items.map((item) => ({
            productId: item.product_id,
            productSku: item.product_sku,
            productName: item.product_name,
            productCategory: item.product_category,
            productImageUrl: item.product_image_url,
            availableStock: item.available_stock,
            transferQuantity: item.transfer_quantity,
            uom: item.uom,
            unitCost: item.unit_cost,
        })),
        attachments: value.attachments?.map((attachment) => ({
            fileName: attachment.file_name,
            fileType: attachment.file_type,
            fileSize: attachment.file_size,
            fileKey: attachment.file_key,
            fileUrl: attachment.file_url,
        })),
    }));
    static transferDecision = z.object({
        comment: z.string().trim().max(500).optional(),
    });
    static rejectTransfer = z.object({
        comment: z.string().trim().min(1).max(500),
    });
    static transferTransition = z.object({
        comment: z.string().trim().max(500).optional(),
    });
    static createInvoice = z.object({
        transferId: optionalUuid,
        sourceCompanyId: uuid,
        destinationCompanyId: uuid,
        invoiceNumber: z.string().trim().min(3).max(80),
        amount: z.string().trim().regex(/^\d+(\.\d{1,2})?$/),
        currency: z.string().trim().length(3).toUpperCase(),
        status: z.enum([
            "DRAFT",
            "ISSUED",
            "PARTIALLY_SETTLED",
            "SETTLED",
            "CANCELLED",
        ]).optional(),
    }).refine((value) => value.sourceCompanyId !== value.destinationCompanyId, {
        message: "Source and destination companies must differ",
        path: ["destinationCompanyId"],
    });
}
