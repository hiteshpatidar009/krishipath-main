export class IpFilterMiddleware {
    static use(blockedIps = new Set()) {
        return (request, response, next) => {
            const ipAddress = request.ip ?? "";
            if (blockedIps.has(ipAddress)) {
                response.status(403).json({
                    success: false,
                    message: "IP blocked",
                });
                return;
            }
            next();
        };
    }
}
