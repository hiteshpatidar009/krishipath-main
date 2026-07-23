export class ErrorParserUtils {
    static parse(error) {
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
