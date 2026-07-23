import { env } from "../../../config/env";
import { BasePostgresConnection } from "../base-postgres.connection";
export class Db1Connection {
    static connection = new BasePostgresConnection(env.db1Options, {
        max: 10,
        min: 2,
        idleTimeoutMillis: 0,
        connectionTimeoutMillis: env.postgresConnectionTimeoutMs,
        query_timeout: env.postgresQueryTimeoutMs,
        statement_timeout: env.postgresStatementTimeoutMs,
    }, "DB1");
    static getInstance() {
        return Db1Connection.connection.getInstance();
    }
    static async connect() {
        await Db1Connection.connection.connect();
    }
    static async disconnect() {
        await Db1Connection.connection.disconnect();
    }
}
