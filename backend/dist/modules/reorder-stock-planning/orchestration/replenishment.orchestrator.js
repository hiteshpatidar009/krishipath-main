export class ReplenishmentOrchestrator {
    classifyRisk(currentAvailable, reorderPoint, minimumStock) {
        if (currentAvailable <= 0)
            return "stockout_risk";
        if (currentAvailable <= minimumStock)
            return "critical_stock";
        if (currentAvailable <= reorderPoint)
            return "low_stock";
        return "healthy";
    }
}
