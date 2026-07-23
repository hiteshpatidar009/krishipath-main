export class TaxAntiTamperMiddleware {
    static use(request, response, next) {
        if (request.body?.taxAmount && request.body?.calculatedTaxAmount && request.body.taxAmount !== request.body.calculatedTaxAmount) {
            response.status(409).json({ success: false, message: "Tax payload tampering detected" });
            return;
        }
        next();
    }
}
