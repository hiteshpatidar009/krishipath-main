import { env } from "../../../config/env";
import { BasePostgresConnection } from "../base-postgres.connection";
export class Db2Connection {
    static connection = new BasePostgresConnection(env.db2Options, {
        max: 10,
        min: 2,
        idleTimeoutMillis: 0,
        connectionTimeoutMillis: env.postgresConnectionTimeoutMs,
        query_timeout: env.postgresQueryTimeoutMs,
        statement_timeout: env.postgresStatementTimeoutMs,
    }, "DB2");
    static getInstance() {
        return Db2Connection.connection.getInstance();
    }
    static async connect() {
        await Db2Connection.connection.connect();
    }
    static async disconnect() {
        await Db2Connection.connection.disconnect();
    }
}
