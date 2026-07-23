export class InMemoryUnitOfWork {
    context;
    commitCallbacks = [];
    rollbackCallbacks = [];
    constructor(context) {
        this.context = context;
    }
    afterCommit(callback) {
        this.commitCallbacks.push(callback);
    }
    afterRollback(callback) {
        this.rollbackCallbacks.push(callback);
    }
    async commit() {
        for (const callback of this.commitCallbacks) {
            await callback();
        }
    }
    async rollback() {
        for (const callback of this.rollbackCallbacks) {
            await callback();
        }
    }
}
