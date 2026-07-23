import crypto from "crypto";
import { BaseService } from "../../../core/base/base.service";
export class LocationService extends BaseService {
    locationRepo;
    constructor(locationRepo) {
        super("LocationService");
        this.locationRepo = locationRepo;
    }
    async getStates() {
        return this.locationRepo.getStates();
    }
    async getDistricts(stateId) {
        if (stateId) {
            return this.locationRepo.getDistrictsByState(stateId);
        }
        return this.locationRepo.getAllDistricts();
    }
    async createState(name, status) {
        const now = new Date();
        return this.locationRepo.createState({
            id: crypto.randomUUID(),
            name: name.trim(),
            status: status || "ACTIVE",
            createdAt: now,
            updatedAt: now
        });
    }
    async updateState(id, name, status) {
        const data = { updatedAt: new Date() };
        if (name)
            data.name = name.trim();
        if (status)
            data.status = status;
        await this.locationRepo.updateState(id, data);
    }
    async deleteState(id) {
        await this.locationRepo.deleteState(id);
    }
    async createDistrict(stateId, name, status) {
        const now = new Date();
        return this.locationRepo.createDistrict({
            id: crypto.randomUUID(),
            stateId,
            name: name.trim(),
            status: status || "ACTIVE",
            createdAt: now,
            updatedAt: now
        });
    }
    async updateDistrict(id, name, stateId, status) {
        const data = { updatedAt: new Date() };
        if (name)
            data.name = name.trim();
        if (stateId)
            data.stateId = stateId;
        if (status)
            data.status = status;
        await this.locationRepo.updateDistrict(id, data);
    }
    async deleteDistrict(id) {
        await this.locationRepo.deleteDistrict(id);
    }
}
