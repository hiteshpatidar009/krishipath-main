export class CountReconciliationOrchestrator {
    variancePercentage(systemQuantity, physicalQuantity) {
        const variance = physicalQuantity - systemQuantity;
        return systemQuantity === 0 ? (variance === 0 ? 0 : 100) : (variance / systemQuantity) * 100;
    }
}
