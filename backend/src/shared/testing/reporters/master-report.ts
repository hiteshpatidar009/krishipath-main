import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import ExcelJS from "exceljs";

interface ExecutionRecord {
  readonly moduleName: string;
  readonly endpoint?: string;
  readonly method?: string;
  readonly testCategory: string;
  readonly testScenario: string;
  readonly payload?: unknown;
  readonly expectedResult: string;
  readonly actualResult: string;
  readonly responseStatus?: number;
  readonly responseBody?: unknown;
  readonly responseTimeMs: number;
  readonly averageLatencyMs: number;
  readonly retryCount: number;
  readonly executionDurationMs: number;
  readonly passFailStatus: "pass" | "fail" | "warning";
  readonly warnings?: readonly string[];
  readonly errors?: readonly string[];
  readonly stackTrace?: string;
  readonly concurrencyNotes?: string;
  readonly securityNotes?: string;
  readonly validationNotes?: string;
}

const reportColumns = [
  ["moduleName", "module name"],
  ["endpoint", "endpoint"],
  ["method", "method"],
  ["testCategory", "test category"],
  ["testScenario", "test scenario"],
  ["payload", "payload"],
  ["expectedResult", "expected result"],
  ["actualResult", "actual result"],
  ["responseStatus", "response status"],
  ["responseBody", "response body"],
  ["responseTimeMs", "response time"],
  ["averageLatencyMs", "average latency"],
  ["retryCount", "retry count"],
  ["executionDurationMs", "execution duration"],
  ["passFailStatus", "pass fail status"],
  ["warnings", "warnings"],
  ["errors", "errors"],
  ["stackTrace", "stack trace"],
  ["concurrencyNotes", "concurrency notes"],
  ["securityNotes", "security notes"],
  ["validationNotes", "validation notes"],
] as const;

export async function generateMasterReport(): Promise<void> {
  const reportsDir = join(process.cwd(), "reports");
  mkdirSync(reportsDir, { recursive: true });
  const moduleNames = existsSync(reportsDir)
    ? readdirSync(reportsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];

  const masterWorkbook = new ExcelJS.Workbook();
  masterWorkbook.creator = "KrishiPath Enterprise QA";
  masterWorkbook.created = new Date();

  for (const moduleName of moduleNames) {
    const records = readExecutionRecords(reportsDir, moduleName);
    await writeModuleWorkbook(reportsDir, moduleName, records);
    addWorksheet(masterWorkbook, moduleName, records);
  }

  if (!moduleNames.length) {
    addWorksheet(masterWorkbook, "summary", []);
  }

  await masterWorkbook.xlsx.writeFile(join(reportsDir, "master-report.xlsx"));
}

function readExecutionRecords(reportsDir: string, moduleName: string): readonly ExecutionRecord[] {
  const filePath = join(reportsDir, moduleName, "execution-log.json");
  if (!existsSync(filePath)) {
    return [];
  }

  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  return Array.isArray(parsed) ? (parsed as ExecutionRecord[]) : [];
}

async function writeModuleWorkbook(
  reportsDir: string,
  moduleName: string,
  records: readonly ExecutionRecord[],
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KrishiPath Enterprise QA";
  workbook.created = new Date();
  addWorksheet(workbook, "test-results", records);
  await workbook.xlsx.writeFile(join(reportsDir, moduleName, "test-results.xlsx"));
}

function addWorksheet(
  workbook: ExcelJS.Workbook,
  moduleName: string,
  records: readonly ExecutionRecord[],
): void {
  const sheet = workbook.addWorksheet(safeSheetName(moduleName));
  sheet.columns = reportColumns.map(([key, header]) => ({
    header,
    key,
    width: Math.max(18, header.length + 8),
  }));

  for (const record of records) {
    sheet.addRow({
      moduleName: record.moduleName,
      endpoint: record.endpoint ?? "",
      method: record.method ?? "",
      testCategory: record.testCategory,
      testScenario: record.testScenario,
      payload: stringifyCell(record.payload),
      expectedResult: record.expectedResult,
      actualResult: record.actualResult,
      responseStatus: record.responseStatus ?? "",
      responseBody: stringifyCell(record.responseBody),
      responseTimeMs: record.responseTimeMs,
      averageLatencyMs: record.averageLatencyMs,
      retryCount: record.retryCount,
      executionDurationMs: record.executionDurationMs,
      passFailStatus: record.passFailStatus,
      warnings: (record.warnings ?? []).join("\n"),
      errors: (record.errors ?? []).join("\n"),
      stackTrace: record.stackTrace ?? "",
      concurrencyNotes: record.concurrencyNotes ?? "",
      securityNotes: record.securityNotes ?? "",
      validationNotes: record.validationNotes ?? "",
    });
  }

  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: reportColumns.length },
  };
}

function safeSheetName(value: string): string {
  return value.replace(/[*?:/\\[\]]/g, "-").slice(0, 31) || "summary";
}

function stringifyCell(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateMasterReport();
}
