export class TransactionUtil {
    static async run(db, callback) {
        return db.transaction(async (tx) => callback(tx));
    }
}
