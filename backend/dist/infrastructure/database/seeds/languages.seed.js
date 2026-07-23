import { Db1Connection } from "../../database/postgres/connections/db1.connection";
import { languagesTable } from "../../database/postgres/schemas/db1/all.schema";
const SUPPORTED_LANGUAGES = [
    { id: "00000000-0000-0000-0000-000000000001", code: "en", name: "English", nativeName: "English", isRtl: false, isActive: true, isDefault: true, sortOrder: 1 },
    { id: "00000000-0000-0000-0000-000000000002", code: "hi", name: "Hindi", nativeName: "हिन्दी", isRtl: false, isActive: true, isDefault: false, sortOrder: 2 },
    { id: "00000000-0000-0000-0000-000000000003", code: "mr", name: "Marathi", nativeName: "मराठी", isRtl: false, isActive: true, isDefault: false, sortOrder: 3 },
    { id: "00000000-0000-0000-0000-000000000004", code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", isRtl: false, isActive: true, isDefault: false, sortOrder: 4 },
    { id: "00000000-0000-0000-0000-000000000005", code: "te", name: "Telugu", nativeName: "తెలుగు", isRtl: false, isActive: true, isDefault: false, sortOrder: 5 },
];
export async function seedLanguages() {
    const db = Db1Connection.getInstance();
    const now = new Date();
    for (const lang of SUPPORTED_LANGUAGES) {
        await db
            .insert(languagesTable)
            .values({ ...lang, createdAt: now, updatedAt: now })
            .onConflictDoUpdate({
            target: [languagesTable.code],
            set: {
                name: lang.name,
                nativeName: lang.nativeName,
                isActive: lang.isActive,
                sortOrder: lang.sortOrder,
                updatedAt: now,
            },
        });
    }
    console.log(`[Seed] Languages seeded: ${SUPPORTED_LANGUAGES.map(l => l.code).join(", ")}`);
}
