import ExcelJS from "exceljs";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { AuthTestConfig } from "../config/auth-test.config";
import { AuthTestMetrics } from "../utils/auth-metrics";
import { AuthApiResult, AuthTestResult } from "../utils/auth-test.types";

const requiredSheets = [
  "Summary",
  "API Results",
  "Security",
  "Spam Tests",
  "MFA",
  "Sessions",
  "Refresh Tokens",
  "Captcha",
  "Performance",
  "Load Tests",
  "Audit Validation",
  "Activity Validation",
  "RBAC Validation",
  "Rate Limiting",
  "Concurrency",
  "Edge Cases",
  "Failures",
] as const;

export class AuthReportWriter {
  constructor(
    private readonly config: AuthTestConfig,
    private readonly metrics: AuthTestMetrics,
  ) {}

  public async writeAll(): Promise<void> {
    mkdirSync(this.config.reportDir, { recursive: true });
    await Promise.all([
      this.writeWorkbook("summary.xlsx"),
      this.writeWorkbook("detailed.xlsx"),
      this.writeWorkbook("performance.xlsx"),
      this.writeWorkbook("failures.xlsx"),
      this.writeWorkbook("security.xlsx"),
    ]);

    writeFileSync(
      path.join(this.config.reportDir, "execution-log.json"),
      JSON.stringify(
        {
          runId: this.config.runId,
          generatedAt: new Date().toISOString(),
          summary: this.metrics.summaryRows(),
          tests: this.metrics.getTests(),
          apiResults: this.metrics.getApis(),
        },
        null,
        2,
      ),
      "utf8",
    );
  }

  private async writeWorkbook(fileName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "RSBC Auth Enterprise Test Framework";
    workbook.created = new Date();
    workbook.modified = new Date();

    for (const sheetName of requiredSheets) {
      this.addSheet(workbook, sheetName);
    }

    await workbook.xlsx.writeFile(path.join(this.config.reportDir, fileName));
  }

  private addSheet(workbook: ExcelJS.Workbook, sheetName: string): void {
    const sheet = workbook.addWorksheet(sheetName);

    if (sheetName === "Summary") {
      addRows(sheet, this.metrics.summaryRows());
      addRows(sheet, this.metrics.moduleHealthRows(), 4);
      this.addLatencyHistogram(sheet, 24);
      return;
    }

    if (sheetName === "API Results") {
      addRows(sheet, this.metrics.getApis());
      applyApiHeatmap(sheet);
      return;
    }

    const rows = this.rowsForSheet(sheetName);
    addRows(sheet, rows);
    if (sheetName === "Performance") {
      this.addLatencyHistogram(sheet, rows.length + 4);
    }
    applyStatusFormatting(sheet);
  }

  private rowsForSheet(sheetName: string): readonly AuthTestResult[] {
    const tests = this.metrics.getTests();
    const by = (predicate: (item: AuthTestResult) => boolean) =>
      tests.filter(predicate);

    switch (sheetName) {
      case "Security":
        return by((item) => item.category === "security");
      case "Spam Tests":
        return by((item) => item.category === "abuse");
      case "MFA":
        return by((item) => item.category === "mfa");
      case "Sessions":
        return by((item) => item.category === "session");
      case "Refresh Tokens":
        return by((item) => item.category === "refresh");
      case "Captcha":
        return by((item) => item.category === "captcha");
      case "Performance":
        return by((item) => item.category === "performance");
      case "Load Tests":
        return by((item) => item.category === "load");
      case "Audit Validation":
        return by((item) => item.category === "audit");
      case "Activity Validation":
        return by((item) => item.category === "activity");
      case "RBAC Validation":
        return by((item) => item.category === "rbac");
      case "Rate Limiting":
        return by((item) => item.category === "rate-limit");
      case "Concurrency":
        return by((item) => item.category === "concurrency");
      case "Edge Cases":
        return by((item) => item.category === "edge");
      case "Failures":
        return by((item) => item.status === "fail");
      default:
        return tests;
    }
  }

  private addLatencyHistogram(sheet: ExcelJS.Worksheet, startRow: number): void {
    const apiRows = this.metrics.getApis();
    const buckets = [
      { label: "0-100ms", min: 0, max: 100 },
      { label: "100-250ms", min: 100, max: 250 },
      { label: "250-500ms", min: 250, max: 500 },
      { label: "500-1000ms", min: 500, max: 1000 },
      { label: "1000ms+", min: 1000, max: Number.POSITIVE_INFINITY },
    ];

    sheet.getCell(startRow, 1).value = "Latency Histogram";
    sheet.getCell(startRow, 1).font = { bold: true };
    sheet.getRow(startRow + 1).values = ["bucket", "count", "bar"];

    buckets.forEach((bucket, index) => {
      const count = apiRows.filter(
        (item) => item.duration >= bucket.min && item.duration < bucket.max,
      ).length;
      const row = sheet.getRow(startRow + 2 + index);
      row.values = [bucket.label, count, "#".repeat(Math.min(count, 60))];
    });
  }
}

function addRows<T extends object>(
  sheet: ExcelJS.Worksheet,
  rows: readonly T[],
  startColumn = 1,
): void {
  if (!rows.length) {
    sheet.getCell(1, startColumn).value = "No records";
    return;
  }

  const headers = Object.keys(rows[0]);
  headers.forEach((header, index) => {
    const cell = sheet.getCell(1, startColumn + index);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    };
  });

  rows.forEach((row, rowIndex) => {
    headers.forEach((header, columnIndex) => {
      const value = (row as Record<string, unknown>)[header];
      sheet.getCell(rowIndex + 2, startColumn + columnIndex).value =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : (value as string | number | boolean | null | undefined);
    });
  });

  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: startColumn },
    to: { row: Math.max(2, rows.length + 1), column: startColumn + headers.length - 1 },
  };
  headers.forEach((header, index) => {
    sheet.getColumn(startColumn + index).width = Math.min(
      Math.max(header.length + 6, 16),
      48,
    );
  });
}

function applyStatusFormatting(sheet: ExcelJS.Worksheet): void {
  const statusColumn = findHeaderColumn(sheet, "status");
  if (!statusColumn) {
    return;
  }

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const cell = sheet.getCell(rowNumber, statusColumn);
    const value = String(cell.value ?? "");
    if (value === "fail") {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } };
    } else if (value === "pass") {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6EFCE" } };
    } else if (value === "warn") {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEB9C" } };
    }
  }
}

function applyApiHeatmap(sheet: ExcelJS.Worksheet): void {
  const durationColumn = findHeaderColumn(sheet, "duration");
  if (!durationColumn) {
    return;
  }

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const cell = sheet.getCell(rowNumber, durationColumn);
    const value = Number(cell.value ?? 0);
    const color =
      value > 1000 ? "FFFFC7CE" : value > 500 ? "FFFFEB9C" : "FFC6EFCE";
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
  }
}

function findHeaderColumn(
  sheet: ExcelJS.Worksheet,
  header: string,
): number | undefined {
  const firstRow = sheet.getRow(1);
  for (let index = 1; index <= firstRow.cellCount; index += 1) {
    if (firstRow.getCell(index).value === header) {
      return index;
    }
  }
  return undefined;
}
