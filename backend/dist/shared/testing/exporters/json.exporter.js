import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
export function writeJsonReport(filePath, value) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}
