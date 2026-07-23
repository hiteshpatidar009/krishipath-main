import { join } from "path";

export function moduleReportPath(moduleName: string, fileName = ""): string {
  return join(process.cwd(), "reports", moduleName, fileName);
}
