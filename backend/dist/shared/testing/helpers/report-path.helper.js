import { join } from "path";
export function moduleReportPath(moduleName, fileName = "") {
    return join(process.cwd(), "reports", moduleName, fileName);
}
