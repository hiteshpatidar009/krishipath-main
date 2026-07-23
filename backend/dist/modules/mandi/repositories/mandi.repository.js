import { eq, inArray } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { mandisTable, statesTable, districtsTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class MandiRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findAll() {
        return this.db
            .select({
            id: mandisTable.id,
            name: mandisTable.name,
            stateId: mandisTable.stateId,
            stateName: statesTable.name,
            districtId: mandisTable.districtId,
            districtName: districtsTable.name,
            status: mandisTable.status,
            openingTime: mandisTable.openingTime,
            closingTime: mandisTable.closingTime,
        })
            .from(mandisTable)
            .innerJoin(statesTable, eq(mandisTable.stateId, statesTable.id))
            .innerJoin(districtsTable, eq(mandisTable.districtId, districtsTable.id))
            .where(eq(mandisTable.status, "ACTIVE"));
    }
    async findById(id) {
        const result = await this.db
            .select()
            .from(mandisTable)
            .where(eq(mandisTable.id, id))
            .limit(1);
        return result[0] || null;
    }
    async findFullById(id) {
        const rows = await this.findFullByIds([id]);
        return rows[0] || null;
    }
    async findAllFull() {
        const active = await this.findAll();
        return this.findFullByIds(active.map((mandi) => mandi.id));
    }
    async findFullByIds(ids) {
        if (ids.length === 0)
            return [];
        return this.db
            .select({
            id: mandisTable.id,
            code: mandisTable.code,
            slug: mandisTable.slug,
            name: mandisTable.name,
            address: mandisTable.address,
            stateId: mandisTable.stateId,
            stateName: statesTable.name,
            districtId: mandisTable.districtId,
            districtName: districtsTable.name,
            latitude: mandisTable.latitude,
            longitude: mandisTable.longitude,
            openingTime: mandisTable.openingTime,
            closingTime: mandisTable.closingTime,
            workingDays: mandisTable.workingDays,
            imageUrls: mandisTable.imageUrls,
            currency: mandisTable.currency,
            defaultUnit: mandisTable.defaultUnit,
            status: mandisTable.status,
        })
            .from(mandisTable)
            .innerJoin(statesTable, eq(mandisTable.stateId, statesTable.id))
            .innerJoin(districtsTable, eq(mandisTable.districtId, districtsTable.id))
            .where(inArray(mandisTable.id, ids));
    }
}
