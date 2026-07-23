import { randomUUID } from "crypto";

import { InMemoryUnitOfWork, TransactionContext, UnitOfWork } from "./unit-of-work";

export interface TransactionalRunner {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export class TransactionManager {
  public async execute<T>(
    work: (unitOfWork: UnitOfWork) => Promise<T>,
    context: Omit<TransactionContext, "id"> = {},
    runner?: TransactionalRunner,
  ): Promise<T> {
    const unitOfWork = new InMemoryUnitOfWork({
      id: randomUUID(),
      ...context,
    });

    const executeWork = async (): Promise<T> => {
      try {
        const result = await work(unitOfWork);
        await unitOfWork.commit();
        return result;
      } catch (error) {
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
