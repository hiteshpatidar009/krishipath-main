import { env } from "../../../config/env";
import { BasePostgresConnection } from "../base-postgres.connection";
export class Db3Connection {
    static connection = new BasePostgresConnection(env.db3Options, {
        max: 8,
        min: 2,
        idleTimeoutMillis: 0,
        connectionTimeoutMillis: env.postgresConnectionTimeoutMs,
        query_timeout: env.postgresQueryTimeoutMs,
        statement_timeout: env.postgresStatementTimeoutMs,
    }, "DB3");
    static getInstance() {
        return Db3Connection.connection.getInstance();
    }
    static async connect() {
        await Db3Connection.connection.connect();
    }
    static async disconnect() {
        await Db3Connection.connection.disconnect();
    }
}
