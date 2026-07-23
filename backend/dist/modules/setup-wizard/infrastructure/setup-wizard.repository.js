import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database";
import { companiesTable } from "../../../infrastructure/database/postgres/schemas/db1";
export class SetupWizardRepository {
    async getStatus(companyId) {
        const rows = await Db1Connection.getInstance()
            .select({ onboardingStatus: companiesTable.onboardingStatus })
            .from(companiesTable)
            .where(eq(companiesTable.id, companyId))
            .limit(1);
        return rows[0]?.onboardingStatus ?? "tenant_created";
    }
    async updateStatus(companyId, onboardingStatus) {
        await Db1Connection.getInstance()
            .update(companiesTable)
            .set({ onboardingStatus, updatedAt: new Date() })
            .where(eq(companiesTable.id, companyId));
    }
}
