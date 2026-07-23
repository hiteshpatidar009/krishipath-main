import fs from "fs";
import path from "path";

interface DbSchemaTarget {
  readonly name: string;
  readonly sqlFile: string;
  readonly drizzleFile: string;
}

interface TableColumns {
  readonly tableName: string;
  readonly columns: ReadonlySet<string>;
}

const ROOT_DIR = process.cwd();

const TARGETS: readonly DbSchemaTarget[] = [
  {
    name: "DB1",
    sqlFile: "database/db_1.schema.sql",
    drizzleFile: "src/infrastructure/database/postgres/schemas/db1/all.schema.ts",
  },
] as const;

const SQL_TABLE_PATTERN =
  /CREATE TABLE IF NOT EXISTS\s+"?([a-zA-Z0-9_]+)"?\s*\(([\s\S]*?)\n\);/g;

const DRIZZLE_TABLE_PATTERN =
  /pgTable\(\s*"([a-zA-Z0-9_]+)"\s*,\s*\{([\s\S]*?)\n\s*\}\s*,?\s*\)/g;

const DRIZZLE_COLUMN_PATTERN =
  /[a-zA-Z0-9_]+\s*:\s*[a-zA-Z0-9_]+\(\s*"([a-zA-Z0-9_]+)"/g;

const SQL_CONSTRAINT_TOKENS = new Set([
  "CONSTRAINT",
  "PRIMARY",
  "FOREIGN",
  "UNIQUE",
  "CHECK",
  "EXCLUDE",
]);

class SchemaDriftCheck {
  public run(): void {
    let driftCount = 0;

    for (const target of TARGETS) {
      const sqlTables = this.parseSqlSchema(target.sqlFile);
      const drizzleTables = this.parseDrizzleSchema(target.drizzleFile);
      const result = this.compare(target.name, sqlTables, drizzleTables);

      driftCount += result;
    }

    if (driftCount > 0) {
      process.exitCode = 1;
    }
  }

  private compare(
    targetName: string,
    sqlTables: ReadonlyMap<string, TableColumns>,
    drizzleTables: ReadonlyMap<string, TableColumns>,
  ): number {
    let driftCount = 0;
    const sqlOnlyTables = [...sqlTables.keys()].filter(
      (tableName) => !drizzleTables.has(tableName),
    );
    const drizzleOnlyTables = [...drizzleTables.keys()].filter(
      (tableName) => !sqlTables.has(tableName),
    );

    this.write(`${targetName}`);
    this.write(`  SQL tables: ${sqlTables.size}`);
    this.write(`  Drizzle tables: ${drizzleTables.size}`);

    if (sqlOnlyTables.length > 0) {
      driftCount += sqlOnlyTables.length;
      this.write(`  SQL-only tables: ${sqlOnlyTables.join(", ")}`);
    }

    if (drizzleOnlyTables.length > 0) {
      driftCount += drizzleOnlyTables.length;
      this.write(`  Drizzle-only tables: ${drizzleOnlyTables.join(", ")}`);
    }

    for (const [tableName, sqlTable] of sqlTables.entries()) {
      const drizzleTable = drizzleTables.get(tableName);

      if (!drizzleTable) {
        continue;
      }

      const sqlOnlyColumns = [...sqlTable.columns].filter(
        (column) => !drizzleTable.columns.has(column),
      );
      const drizzleOnlyColumns = [...drizzleTable.columns].filter(
        (column) => !sqlTable.columns.has(column),
      );

      if (sqlOnlyColumns.length === 0 && drizzleOnlyColumns.length === 0) {
        continue;
      }

      driftCount += 1;
      this.write(`  ${tableName}`);
      this.write(
        `    SQL-only columns: ${sqlOnlyColumns.join(", ") || "none"}`,
      );
      this.write(
        `    Drizzle-only columns: ${drizzleOnlyColumns.join(", ") || "none"}`,
      );
    }

    if (driftCount === 0) {
      this.write("  Drift: none");
    }

    return driftCount;
  }

  private parseSqlSchema(filePath: string): ReadonlyMap<string, TableColumns> {
    const content = this.readWorkspaceFile(filePath);
    const tables = new Map<string, TableColumns>();
    let match: RegExpExecArray | null;

    SQL_TABLE_PATTERN.lastIndex = 0;
    while ((match = SQL_TABLE_PATTERN.exec(content))) {
      const tableName = match[1];
      const body = match[2];
      tables.set(tableName, {
        tableName,
        columns: new Set(this.extractSqlColumns(body)),
      });
    }

    return tables;
  }

  private parseDrizzleSchema(
    filePath: string,
  ): ReadonlyMap<string, TableColumns> {
    const content = this.readWorkspaceFile(filePath);
    const tables = new Map<string, TableColumns>();
    let tableMatch: RegExpExecArray | null;

    DRIZZLE_TABLE_PATTERN.lastIndex = 0;
    while ((tableMatch = DRIZZLE_TABLE_PATTERN.exec(content))) {
      const tableName = tableMatch[1];
      const body = tableMatch[2];
      const columns: string[] = [];
      let columnMatch: RegExpExecArray | null;

      DRIZZLE_COLUMN_PATTERN.lastIndex = 0;
      while ((columnMatch = DRIZZLE_COLUMN_PATTERN.exec(body))) {
        columns.push(columnMatch[1]);
      }

      tables.set(tableName, {
        tableName,
        columns: new Set(columns),
      });
    }

    return tables;
  }

  private extractSqlColumns(tableBody: string): readonly string[] {
    const columns: string[] = [];

    for (const rawLine of tableBody.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("--")) {
        continue;
      }

      const token = line
        .split(/\s+/)[0]
        .replace(/[,;]/g, "")
        .replace(/"/g, "");

      if (!token || SQL_CONSTRAINT_TOKENS.has(token.toUpperCase())) {
        continue;
      }

      columns.push(token);
    }

    return columns;
  }

  private readWorkspaceFile(filePath: string): string {
    return fs.readFileSync(path.join(ROOT_DIR, filePath), "utf8");
  }

  private write(message: string): void {
    process.stdout.write(`${message}\n`);
  }
}

new SchemaDriftCheck().run();
