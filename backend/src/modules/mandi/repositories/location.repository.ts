import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { statesTable, districtsTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class LocationRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  public async getStates() {
    return this.db.select().from(statesTable);
  }

  public async getAllDistricts() {
    return this.db.select().from(districtsTable);
  }

  public async getDistrictsByState(stateId: string) {
    return this.db
      .select()
      .from(districtsTable)
      .where(eq(districtsTable.stateId, stateId));
  }

  public async createState(data: { id: string; name: string; status?: string; createdAt: Date; updatedAt: Date }) {
    await this.db.insert(statesTable).values(data);
    return data;
  }

  public async updateState(id: string, data: Partial<{ name: string; status: string; updatedAt: Date }>) {
    await this.db.update(statesTable).set(data).where(eq(statesTable.id, id));
  }

  public async deleteState(id: string) {
    await this.db.delete(statesTable).where(eq(statesTable.id, id));
  }

  public async createDistrict(data: { id: string; stateId: string; name: string; status?: string; createdAt: Date; updatedAt: Date }) {
    await this.db.insert(districtsTable).values(data);
    return data;
  }

  public async updateDistrict(id: string, data: Partial<{ name: string; stateId: string; status: string; updatedAt: Date }>) {
    await this.db.update(districtsTable).set(data).where(eq(districtsTable.id, id));
  }

  public async deleteDistrict(id: string) {
    await this.db.delete(districtsTable).where(eq(districtsTable.id, id));
  }
}
