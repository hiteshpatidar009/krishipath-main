import { randomUUID } from "crypto";
import { InMemoryUnitOfWork } from "./unit-of-work";
export class TransactionManager {
    async execute(work, context = {}, runner) {
        const unitOfWork = new InMemoryUnitOfWork({
            id: randomUUID(),
            ...context,
        });
        const executeWork = async () => {
            try {
                const result = await work(unitOfWork);
                await unitOfWork.commit();
                return result;
            }
            catch (error) {
                await unitOfWork.rollback();
                throw error;
            }
        };
        if (runner) {
            return runner.runInTransaction(executeWork);
        }
        return executeWork();
    }
}
