import { StackInfo } from "../logger.types";

export class FileLocationUtils {
  public static parseStackLine(line: string): StackInfo {
    const match = line.match(/at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/);

    if (!match) {
      return {};
    }

    return {
      functionName: match[1],
      fileName: match[2],
      lineNumber: Number(match[3]),
      columnNumber: Number(match[4]),
    };
  }
}
