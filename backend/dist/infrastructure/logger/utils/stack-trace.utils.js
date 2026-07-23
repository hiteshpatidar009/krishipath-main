import { FileLocationUtils } from "./file-location.utils";
export class StackTraceUtils {
    static extract(stack) {
        if (!stack) {
            return {};
        }
        const relevantLine = stack
            .split("\n")
            .find((line) => line.includes("src/") || line.includes("src\\"));
        if (!relevantLine) {
            return {};
        }
        return FileLocationUtils.parseStackLine(relevantLine);
    }
}
