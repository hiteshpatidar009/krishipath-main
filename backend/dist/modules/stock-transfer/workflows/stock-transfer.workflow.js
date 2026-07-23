import { TransferTransitionPolicy } from "../domain";
export class StockTransferWorkflow {
    policy = new TransferTransitionPolicy();
    validate(current, target) {
        this.policy.ensure(current, target);
    }
}
