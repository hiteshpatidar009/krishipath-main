import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
export class MandiTraderService extends BaseService {
    mandiTraderRepo;
    mandiAdminRepo;
    constructor(mandiTraderRepo, mandiAdminRepo) {
        super("MandiTraderService");
        this.mandiTraderRepo = mandiTraderRepo;
        this.mandiAdminRepo = mandiAdminRepo;
    }
    listAllTraders() {
        return this.mandiTraderRepo.listAllTraders();
    }
    async createTrader(data) {
        const shopName = String(data?.shopName || "").trim();
        const phone = this.normalizePhone(data?.phone);
        const primaryMandiId = String(data?.primaryMandiId || "").trim();
        if (!shopName)
            throw new AppError("shopName is required", 422, "SHOP_NAME_REQUIRED");
        if (!primaryMandiId)
            throw new AppError("primaryMandiId is required", 422, "PRIMARY_MANDI_REQUIRED");
        if (!await this.mandiAdminRepo.findByIdFull(primaryMandiId))
            throw new AppError("Primary mandi not found", 404, "MANDI_NOT_FOUND");
        const verificationStatus = String(data?.verificationStatus || "PENDING").toUpperCase();
        if (!["PENDING", "APPROVED", "REJECTED"].includes(verificationStatus)) {
            throw new AppError("verificationStatus is invalid", 422, "INVALID_VERIFICATION_STATUS");
        }
        const user = await this.mandiTraderRepo.findUserByPhone(phone);
        if (user) {
            if (user.userType !== "trader")
                throw new AppError("Phone belongs to a non-trader account", 409, "PHONE_ALREADY_REGISTERED");
            if (await this.mandiTraderRepo.findTraderByUserId(user.id))
                throw new AppError("Trader already registered", 409, "TRADER_ALREADY_REGISTERED");
            return this.mandiTraderRepo.createTraderProfile(user.id, {
                shopName,
                licenseNumber: String(data?.licenseNumber || "").trim() || null,
                primaryMandiId,
                cropSpecializations: Array.isArray(data?.cropSpecializations) ? data.cropSpecializations : [],
                verificationStatus,
            });
        }
        return this.mandiTraderRepo.createTraderWithUser({
            phone,
            shopName,
            licenseNumber: String(data?.licenseNumber || "").trim() || null,
            primaryMandiId,
            cropSpecializations: Array.isArray(data?.cropSpecializations) ? data.cropSpecializations : [],
            verificationStatus,
        });
    }
    async updateTrader(traderId, data) {
        if (!await this.mandiTraderRepo.findTraderById(traderId))
            throw new AppError("Trader not found", 404, "TRADER_NOT_FOUND");
        const patch = {};
        if (data?.shopName !== undefined) {
            const shopName = String(data.shopName || "").trim();
            if (!shopName)
                throw new AppError("shopName cannot be empty", 422, "INVALID_SHOP_NAME");
            patch.shopName = shopName;
        }
        if (data?.licenseNumber !== undefined)
            patch.licenseNumber = String(data.licenseNumber || "").trim() || null;
        if (data?.cropSpecializations !== undefined) {
            if (!Array.isArray(data.cropSpecializations))
                throw new AppError("cropSpecializations must be an array", 422, "INVALID_CROPS");
            patch.cropSpecializations = data.cropSpecializations;
        }
        if (data?.primaryMandiId !== undefined) {
            const mandiId = String(data.primaryMandiId || "").trim();
            if (!await this.mandiAdminRepo.findByIdFull(mandiId))
                throw new AppError("Primary mandi not found", 404, "MANDI_NOT_FOUND");
            patch.primaryMandiId = mandiId;
        }
        if (data?.verificationStatus !== undefined) {
            const status = String(data.verificationStatus).toUpperCase();
            if (!["PENDING", "APPROVED", "REJECTED"].includes(status))
                throw new AppError("verificationStatus is invalid", 422, "INVALID_VERIFICATION_STATUS");
            patch.verificationStatus = status;
        }
        if (data?.isActive !== undefined)
            patch.isActive = Boolean(data.isActive);
        if (!Object.keys(patch).length)
            throw new AppError("No editable trader fields provided", 400, "EMPTY_UPDATE");
        return this.mandiTraderRepo.updateTrader(traderId, patch);
    }
    normalizePhone(value) {
        const digits = String(value || "").replace(/\D/g, "");
        if (digits.length === 10)
            return `+91${digits}`;
        if (digits.length === 12 && digits.startsWith("91"))
            return `+${digits}`;
        throw new AppError("A valid Indian mobile number is required", 422, "INVALID_PHONE_NUMBER");
    }
    async getTraders(mandiId) {
        const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
        if (!mandi)
            throw new AppError("Mandi not found", 404);
        return this.mandiTraderRepo.findByMandi(mandiId);
    }
    async assignTrader(mandiId, traderId, assignedBy, notes) {
        const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
        if (!mandi)
            throw new AppError("Mandi not found", 404);
        const existing = await this.mandiTraderRepo.findOne(mandiId, traderId);
        const id = existing?.id ?? randomUUID();
        await this.mandiTraderRepo.assign({ id, mandiId, traderId, assignedBy, notes });
        return this.mandiTraderRepo.findOne(mandiId, traderId);
    }
    async removeTrader(mandiId, traderId) {
        const assignment = await this.mandiTraderRepo.findOne(mandiId, traderId);
        if (!assignment)
            throw new AppError("Trader not assigned to this mandi", 404);
        await this.mandiTraderRepo.updateStatus(mandiId, traderId, "REMOVED");
    }
    async suspendTrader(mandiId, traderId) {
        const assignment = await this.mandiTraderRepo.findOne(mandiId, traderId);
        if (!assignment)
            throw new AppError("Trader not assigned to this mandi", 404);
        await this.mandiTraderRepo.updateStatus(mandiId, traderId, "SUSPENDED");
    }
    async transferTrader(traderId, fromMandiId, toMandiId, transferredBy) {
        // Remove from source mandi
        const fromAssignment = await this.mandiTraderRepo.findOne(fromMandiId, traderId);
        if (!fromAssignment)
            throw new AppError("Trader not found in source mandi", 404);
        const toMandi = await this.mandiAdminRepo.findByIdFull(toMandiId);
        if (!toMandi)
            throw new AppError("Target mandi not found", 404);
        await this.mandiTraderRepo.updateStatus(fromMandiId, traderId, "REMOVED");
        await this.assignTrader(toMandiId, traderId, transferredBy, `Transferred from mandi ${fromMandiId}`);
    }
}
