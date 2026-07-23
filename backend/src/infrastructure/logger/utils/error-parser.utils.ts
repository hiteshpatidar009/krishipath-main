export interface ParsedError {
  error: Error;
  message: string;
}

export class ErrorParserUtils {
  public static parse(error: unknown): ParsedError {
    if (error instanceof Error) {
      return {
        error,
        message: error.message,
      };
    }

    return {
      error: new Error("Unknown error"),
      message: "Unknown error",
    };
  }
}
