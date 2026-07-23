import { StackInfo } from "../logger.types";
import { FileLocationUtils } from "./file-location.utils";

export class StackTraceUtils {
  public static extract(stack?: string): StackInfo {
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
