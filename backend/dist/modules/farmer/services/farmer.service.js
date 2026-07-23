import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
export class FarmerService extends BaseService {
    farmerRepo;
    eventDispatcher;
    mandiProductRepo;
    static notificationDefaults = {
        priceAlerts: true,
        mandiUpdates: true,
        weather: true,
        aiTips: true,
        community: true,
        news: false,
        email: false,
        sms: false,
        muteAll: false,
    };
    constructor(farmerRepo, eventDispatcher, mandiProductRepo) {
        super("FarmerService");
        this.farmerRepo = farmerRepo;
        this.eventDispatcher = eventDispatcher;
        this.mandiProductRepo = mandiProductRepo;
    }
    async getProfile(userId) {
        const existing = await this.farmerRepo.findByUserId(userId);
        if (existing)
            return existing;
        // Farmer OTP login creates the account first. Lazily create the linked
        // domain profile from that verified account so onboarding and every Home
        // user-specific endpoint have a stable farmer identity.
        return this.farmerRepo.upsertProfile(userId, { profileStatus: "INCOMPLETE" });
    }
    async updateProfile(userId, data) {
        const allowedFields = [
            "firstName", "lastName", "village", "landSizeAcres", "irrigationType",
            "soilType", "experienceYears", "alternatePhone", "dob", "gender",
            "profilePhotoUrl", "profileStatus", "gpsLat", "gpsLng", "gpsConsent",
            "stateId", "districtId", "preferredMandiId",
        ];
        const sanitized = {};
        for (const field of allowedFields) {
            if (data?.[field] !== undefined)
                sanitized[field] = data[field];
        }
        if (sanitized.firstName !== undefined)
            sanitized.firstName = String(sanitized.firstName || "").trim() || null;
        if (sanitized.lastName !== undefined)
            sanitized.lastName = String(sanitized.lastName || "").trim() || null;
        if (sanitized.village !== undefined)
            sanitized.village = String(sanitized.village || "").trim() || null;
        if (sanitized.landSizeAcres !== undefined && sanitized.landSizeAcres !== null) {
            const acres = Number(sanitized.landSizeAcres);
            if (!Number.isFinite(acres) || acres < 0 || acres > 100000)
                throw new AppError("landSizeAcres is invalid", 422, "INVALID_LAND_SIZE");
            sanitized.landSizeAcres = String(acres);
        }
        if (sanitized.experienceYears !== undefined && sanitized.experienceYears !== null) {
            const years = Number(sanitized.experienceYears);
            if (!Number.isInteger(years) || years < 0 || years > 100)
                throw new AppError("experienceYears is invalid", 422, "INVALID_EXPERIENCE");
            sanitized.experienceYears = years;
        }
        if (!Object.keys(sanitized).length)
            throw new AppError("No editable profile fields were provided", 400, "EMPTY_PROFILE_UPDATE");
        const profile = await this.farmerRepo.upsertProfile(userId, sanitized);
        // Check if mandatory fields are complete to mark profileStatus as COMPLETE
        if (profile?.firstName &&
            profile?.stateId &&
            profile?.districtId &&
            profile?.preferredMandiId &&
            profile?.profileStatus === "INCOMPLETE") {
            // In a real app we might also check if they have products. 
            // For now we assume if they hit the complete profile endpoint, it updates status
            await this.farmerRepo.upsertProfile(userId, { profileStatus: "COMPLETE" });
            // We would emit FarmerProfileCompleted event here
        }
        return this.getProfile(userId);
    }
    async updatePreferences(userId, mandiIds, productIds) {
        const profile = await this.farmerRepo.findByUserId(userId);
        if (!profile)
            throw new AppError("Farmer profile not found", 404, "NOT_FOUND");
        const uniqueMandiIds = Array.from(new Set(mandiIds || []));
        const uniqueProductIds = Array.from(new Set(productIds || []));
        const primaryMandiId = uniqueMandiIds[0] || profile.preferredMandiId;
        if (uniqueProductIds.length > 0) {
            if (!primaryMandiId) {
                throw new AppError("Select a primary mandi before selecting crops", 400, "PRIMARY_MANDI_REQUIRED");
            }
            const enabledMandiIds = await this.mandiProductRepo.getMandiIdsForCrop(uniqueProductIds[0]);
            if (!enabledMandiIds.includes(primaryMandiId)) {
                throw new AppError("Primary crop must be available in the primary mandi", 400, "PRIMARY_CROP_NOT_AVAILABLE");
            }
        }
        if (uniqueMandiIds.length > 0) {
            if (uniqueMandiIds.length > 10)
                throw new AppError("Maximum 10 mandis allowed", 400, "LIMIT_EXCEEDED");
            await this.farmerRepo.setPreferredMandis(profile.id, uniqueMandiIds);
            await this.farmerRepo.upsertProfile(userId, { preferredMandiId: uniqueMandiIds[0] });
        }
        if (uniqueProductIds.length > 0) {
            if (uniqueProductIds.length > 15)
                throw new AppError("Maximum 15 products allowed", 400, "LIMIT_EXCEEDED");
            await this.farmerRepo.setTrackedCrops(profile.id, uniqueProductIds);
        }
        // We would emit FarmerPreferencesUpdated event here
        return this.farmerRepo.findByUserId(userId);
    }
    async getNotificationPreferences(userId) {
        const saved = await this.farmerRepo.getNotificationPreferences(userId);
        return { ...FarmerService.notificationDefaults, ...(saved && typeof saved === "object" ? saved : {}) };
    }
    async updateNotificationPreferences(userId, input) {
        const allowed = Object.keys(FarmerService.notificationDefaults);
        const current = await this.getNotificationPreferences(userId);
        const next = { ...current };
        let changed = false;
        for (const key of allowed) {
            if (input?.[key] === undefined)
                continue;
            if (typeof input[key] !== "boolean")
                throw new AppError(`${key} must be boolean`, 422, "INVALID_NOTIFICATION_PREFERENCE");
            next[key] = input[key];
            changed = true;
        }
        if (!changed)
            throw new AppError("No notification preference was provided", 400, "EMPTY_NOTIFICATION_PREFERENCES");
        const saved = await this.farmerRepo.updateNotificationPreferences(userId, next);
        if (!saved)
            throw new AppError("User not found", 404, "NOT_FOUND");
        return { ...FarmerService.notificationDefaults, ...saved };
    }
    async getCalendar(userId, year, month) {
        if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
            throw new AppError("A valid year and month are required", 400);
        }
        const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const toDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
        const events = await this.farmerRepo.getCalendarEvents(userId, fromDate, toDate);
        const today = new Date();
        return {
            year,
            month,
            highlightedDay: today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : null,
            eventDays: Array.from(new Set(events.map((event) => Number(String(event.eventDate).slice(-2))))),
            events,
        };
    }
    async getMarketWatchlist(userId) {
        return this.farmerRepo.getMarketWatchlist(userId);
    }
    async saveMarketWatch(userId, mandiId, productId) {
        if (!mandiId || !productId)
            throw new AppError("mandiId and productId are required", 400);
        const assignment = await this.mandiProductRepo.findOne(mandiId, productId);
        if (!assignment || !assignment.isEnabled) {
            throw new AppError("This crop is not available in the selected mandi", 404);
        }
        const saved = await this.farmerRepo.saveMarketWatch(userId, mandiId, productId);
        if (!saved)
            throw new AppError("Farmer profile not found", 404);
        return saved;
    }
    async removeMarketWatch(userId, mandiId, productId) {
        if (!mandiId || !productId)
            throw new AppError("mandiId and productId are required", 400);
        return { removed: await this.farmerRepo.removeMarketWatch(userId, mandiId, productId) };
    }
    async createCalendarEvent(userId, data) {
        if (!data?.title || !/^\d{4}-\d{2}-\d{2}$/.test(data?.eventDate || "")) {
            throw new AppError("title and eventDate (YYYY-MM-DD) are required", 400);
        }
        const created = await this.farmerRepo.createCalendarEvent(userId, data);
        if (!created)
            throw new AppError("Farmer profile not found", 404);
        return created;
    }
    async getTasks(userId) {
        const tasks = await this.farmerRepo.getTasks(userId);
        const priorityColors = { HIGH: "#E74C3C", MEDIUM: "#F39C12", LOW: "#27AE60" };
        return tasks.map((task) => {
            const cropSlug = String(task.cropName || task.cropCode || "crop").toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return {
                ...task,
                labelKey: null,
                label: task.title,
                dateLabel: task.dueDate,
                cropKey: task.productId ? `crop_${cropSlug}` : "",
                isCompleted: task.status === "COMPLETED",
                priorityColor: priorityColors[task.priority] || priorityColors.MEDIUM,
            };
        });
    }
    async createTask(userId, data) {
        if (!data?.title || !/^\d{4}-\d{2}-\d{2}$/.test(data?.dueDate || "")) {
            throw new AppError("title and dueDate (YYYY-MM-DD) are required", 400);
        }
        const created = await this.farmerRepo.createTask(userId, data);
        if (!created)
            throw new AppError("Farmer profile not found", 404);
        return created;
    }
    async completeTask(userId, taskId) {
        const updated = await this.farmerRepo.completeTask(userId, taskId);
        if (!updated)
            throw new AppError("Task not found", 404);
        return updated;
    }
}
