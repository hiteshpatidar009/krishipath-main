export class ResponseLoggerMiddleware {
    static use(_request, response, next) {
        response.setHeader("x-response-timestamp", new Date().toISOString());
        next();
    }
}
