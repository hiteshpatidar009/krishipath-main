export interface TransactionExecutor {
  transaction<T>(callback: (tx: unknown) => Promise<T>): Promise<T>;
}

export class TransactionUtil {
  public static async run<T>(
    db: TransactionExecutor,
    callback: (tx: unknown) => Promise<T>,
  ): Promise<T> {
    return db.transaction(async (tx) => callback(tx));
  }
}
