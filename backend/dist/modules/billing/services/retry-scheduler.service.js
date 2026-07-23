import { PaymentStatus, RetryStatus } from "../constants/billing.constants";
export class BillingRetrySchedulerService {
    repository;
    paymentGateway;
    dunningService;
    constructor(repository, paymentGateway, dunningService) {
        this.repository = repository;
        this.paymentGateway = paymentGateway;
        this.dunningService = dunningService;
    }
    async processDueRetries(context, limit = 25) {
        const retries = await this.repository.listDueRetries(limit);
        let processed = 0;
        for (const retry of retries) {
            await this.repository.updateRetry(retry.companyId, retry.id, {
                status: RetryStatus.Processing,
                processedAt: new Date(),
            });
            const invoice = await this.repository.findInvoiceById(retry.companyId, retry.invoiceId);
            const payment = await this.repository.findPaymentById(retry.companyId, retry.paymentId);
            if (!invoice || !payment) {
                await this.repository.updateRetry(retry.companyId, retry.id, {
                    status: RetryStatus.Failed,
                    failureReason: "Invoice or payment was not found",
                });
                continue;
            }
            const result = await this.paymentGateway.charge({
                companyId: retry.companyId,
                invoiceId: invoice.id,
                amount: invoice.totalAmount,
                currencyCode: invoice.currencyCode,
                idempotencyKey: `retry:${retry.id}`,
            });
            if (result.status === PaymentStatus.Succeeded) {
                await this.repository.updatePayment(retry.companyId, payment.id, {
                    status: PaymentStatus.Succeeded,
                    gatewayPaymentId: result.gatewayPaymentId,
                    paidAt: new Date(),
                    failureReason: null,
                });
                await this.repository.updateRetry(retry.companyId, retry.id, {
                    status: RetryStatus.Succeeded,
                    failureReason: null,
                });
            }
            else {
                await this.repository.updateRetry(retry.companyId, retry.id, {
                    status: RetryStatus.Failed,
                    failureReason: result.failureReason ?? "Gateway retry failed",
                });
                await this.dunningService.handlePaymentFailure({
                    ...payment,
                    failureReason: result.failureReason ?? "Gateway retry failed",
                }, context);
            }
            processed += 1;
        }
        return { processed };
    }
}
