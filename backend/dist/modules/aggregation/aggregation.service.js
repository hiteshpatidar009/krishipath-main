import { Db1Connection } from "../../infrastructure/database/postgres/connections/db1.connection";
import { mandiReferencePricesTable, priceSubmissionsTable } from "../../infrastructure/database/postgres/schemas/db1/price.schema";
import { eq, and, gt } from "drizzle-orm";
export class AggregationEngineService {
    /**
     * Recalculates the reference prices for a given mandi and product variant.
     * This should be called whenever a new price submission is verified.
     */
    async recalculateMandiReferencePrice(mandiId, productId, variantId) {
        const db = Db1Connection.getInstance();
        // 1. Fetch all VERIFIED price submissions for today (or last 24h) for this specific mandi+product+variant
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const submissions = await db.select().from(priceSubmissionsTable).where(and(eq(priceSubmissionsTable.mandiId, mandiId), eq(priceSubmissionsTable.productId, productId), eq(priceSubmissionsTable.variantId, variantId), eq(priceSubmissionsTable.status, "VERIFIED"), gt(priceSubmissionsTable.recordedAt, today)));
        if (submissions.length === 0) {
            return; // No data to aggregate
        }
        // 2. Perform aggregation (Weighted average based on aiConfidence or TrustScore)
        // Simple average for now
        let totalMin = 0;
        let totalMax = 0;
        let validCount = 0;
        for (const sub of submissions) {
            if (sub.minPrice && sub.maxPrice) {
                totalMin += Number(sub.minPrice);
                totalMax += Number(sub.maxPrice);
                validCount++;
            }
        }
        if (validCount === 0)
            return;
        const avgMin = totalMin / validCount;
        const avgMax = totalMax / validCount;
        const avgPrice = (avgMin + avgMax) / 2;
        // 3. Upsert into mandi_reference_prices
        // Assuming unit is standard for now, but should ideally be grouped by unit too.
        const unit = submissions[0].unit;
        // Check if reference price exists
        const [existingRef] = await db.select().from(mandiReferencePricesTable).where(and(eq(mandiReferencePricesTable.mandiId, mandiId), eq(mandiReferencePricesTable.productId, productId), eq(mandiReferencePricesTable.variantId, variantId))).limit(1);
        if (existingRef) {
            await db.update(mandiReferencePricesTable)
                .set({
                refMinPrice: avgMin.toString(),
                refMaxPrice: avgMax.toString(),
                refAvgPrice: avgPrice.toString(),
                traderCount: validCount,
                lastCalculatedAt: new Date(),
            })
                .where(eq(mandiReferencePricesTable.id, existingRef.id));
        }
        else {
            await db.insert(mandiReferencePricesTable).values({
                mandiId,
                productId,
                variantId,
                unit,
                refMinPrice: avgMin.toString(),
                refMaxPrice: avgMax.toString(),
                refAvgPrice: avgPrice.toString(),
                traderCount: validCount,
                lastCalculatedAt: new Date(),
            });
        }
        console.log(`[Aggregation Engine] Recalculated reference price for Mandi ${mandiId}, Product ${productId}. Traders: ${validCount}`);
    }
}
