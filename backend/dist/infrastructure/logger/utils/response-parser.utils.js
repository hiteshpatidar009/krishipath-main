export class ResponseParserUtils {
    static toMetadata(response, duration) {
        return {
            statusCode: response.statusCode,
            duration,
        };
    }
}
