export class ReorderReviewWorkflow {
    requiresManualReview(reviewMode) {
        return reviewMode === "manual";
    }
}
