export interface TransactionContext {
  readonly id: string;
  readonly companyId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface UnitOfWork {
  readonly context: TransactionContext;
  afterCommit(callback: () => Promise<void> | void): void;
  afterRollback(callback: () => Promise<void> | void): void;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class InMemoryUnitOfWork implements UnitOfWork {
  private readonly commitCallbacks: Array<() => Promise<void> | void> = [];
  private readonly rollbackCallbacks: Array<() => Promise<void> | void> = [];

  constructor(public readonly context: TransactionContext) {}

  public afterCommit(callback: () => Promise<void> | void): void {
    this.commitCallbacks.push(callback);
  }

  public afterRollback(callback: () => Promise<void> | void): void {
    this.rollbackCallbacks.push(callback);
  }

  public async commit(): Promise<void> {
    for (const callback of this.commitCallbacks) {
      await callback();
    }
  }

  public async rollback(): Promise<void> {
    for (const callback of this.rollbackCallbacks) {
      await callback();
    }
  }
}
