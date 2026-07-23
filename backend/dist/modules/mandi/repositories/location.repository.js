import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { statesTable, districtsTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class LocationRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async getStates() {
        return this.db.select().from(statesTable);
    }
    async getAllDistricts() {
        return this.db.select().from(districtsTable);
    }
    async getDistrictsByState(stateId) {
        return this.db
            .select()
            .from(districtsTable)
            .where(eq(districtsTable.stateId, stateId));
    }
    async createState(data) {
        await this.db.insert(statesTable).values(data);
        return data;
    }
    async updateState(id, data) {
        await this.db.update(statesTable).set(data).where(eq(statesTable.id, id));
    }
    async deleteState(id) {
        await this.db.delete(statesTable).where(eq(statesTable.id, id));
    }
    async createDistrict(data) {
        await this.db.insert(districtsTable).values(data);
        return data;
    }
    async updateDistrict(id, data) {
        await this.db.update(districtsTable).set(data).where(eq(districtsTable.id, id));
    }
    async deleteDistrict(id) {
        await this.db.delete(districtsTable).where(eq(districtsTable.id, id));
    }
}
