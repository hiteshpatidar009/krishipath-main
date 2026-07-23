import crypto from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { LocationRepository } from "../repositories/location.repository";

export class LocationService extends BaseService {
  constructor(private readonly locationRepo: LocationRepository) {
    super("LocationService");
  }

  public async getStates() {
    return this.locationRepo.getStates();
  }

  public async getDistricts(stateId?: string) {
    if (stateId) {
      return this.locationRepo.getDistrictsByState(stateId);
    }
    return this.locationRepo.getAllDistricts();
  }

  public async createState(name: string, status?: string) {
    const now = new Date();
    return this.locationRepo.createState({
      id: crypto.randomUUID(),
      name: name.trim(),
      status: status || "ACTIVE",
      createdAt: now,
      updatedAt: now
    });
  }

  public async updateState(id: string, name?: string, status?: string) {
    const data: any = { updatedAt: new Date() };
    if (name) data.name = name.trim();
    if (status) data.status = status;
    await this.locationRepo.updateState(id, data);
  }

  public async deleteState(id: string) {
    await this.locationRepo.deleteState(id);
  }

  public async createDistrict(stateId: string, name: string, status?: string) {
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

  public async updateDistrict(id: string, name?: string, stateId?: string, status?: string) {
    const data: any = { updatedAt: new Date() };
    if (name) data.name = name.trim();
    if (stateId) data.stateId = stateId;
    if (status) data.status = status;
    await this.locationRepo.updateDistrict(id, data);
  }

  public async deleteDistrict(id: string) {
    await this.locationRepo.deleteDistrict(id);
  }
}
