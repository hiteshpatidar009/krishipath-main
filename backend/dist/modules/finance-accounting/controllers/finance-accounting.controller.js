import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { FinanceAccountingValidator } from "../validators/finance-accounting.validator";
export class FinanceAccountingController {
    service;
    constructor(service) {
        this.service = service;
    }
    createInvoice = async (request, response) => {
        const input = FinanceAccountingValidator.invoice.parse(request.body);
        ApiResponse.created(response, await this.service.createInvoice({
            ...input,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
        }), "Invoice created");
    };
    updateInvoice = async (request, response) => {
        const input = FinanceAccountingValidator.update.parse(request.body);
        ApiResponse.ok(response, await this.service.updateInvoice({
            ...input,
            companyId: RequestContext.companyId(request),
            invoiceId: String(request.params.invoiceId),
            actorId: RequestContext.userId(request),
        }), "Invoice updated");
    };
    listInvoices = async (request, response) => {
        const query = FinanceAccountingValidator.list.parse(request.query);
        ApiResponse.ok(response, await this.service.listInvoices({
            ...query,
            companyId: RequestContext.companyId(request),
        }), "Invoices loaded");
    };
    getInvoice = async (request, response) => {
        const invoice = await this.service.getInvoice(RequestContext.companyId(request), String(request.params.invoiceId));
        if (!invoice) {
            ApiResponse.notFound(response, "Invoice not found");
            return;
        }
        ApiResponse.ok(response, invoice, "Invoice loaded");
    };
    approveInvoice = this.decision("approveInvoice");
    sendInvoice = this.decision("sendInvoice");
    cancelInvoice = this.decision("cancelInvoice");
    recordPayment = async (request, response) => {
        const input = FinanceAccountingValidator.payment.parse(request.body);
        ApiResponse.created(response, await this.service.recordPayment({
            ...input,
            companyId: RequestContext.companyId(request),
            invoiceId: String(request.params.invoiceId),
            actorId: RequestContext.userId(request),
        }), "Payment recorded");
    };
    chartOfAccounts = async (request, response) => {
        ApiResponse.ok(response, await this.service.chartOfAccounts(RequestContext.companyId(request)), "Chart of accounts loaded");
    };
    accountingEvents = async (request, response) => {
        ApiResponse.ok(response, await this.service.accountingEvents(RequestContext.companyId(request)), "Accounting events loaded");
    };
    arSummary = async (request, response) => {
        ApiResponse.ok(response, await this.service.arSummary(RequestContext.companyId(request)), "AR summary loaded");
    };
    apSummary = async (request, response) => {
        ApiResponse.ok(response, await this.service.apSummary(RequestContext.companyId(request)), "AP summary loaded");
    };
    decision(method) {
        return async (request, response) => {
            const input = FinanceAccountingValidator.decision.parse(request.body);
            ApiResponse.ok(response, await this.service[method]({
                ...input,
                companyId: RequestContext.companyId(request),
                invoiceId: String(request.params.invoiceId),
                actorId: RequestContext.userId(request),
            }), "Invoice action completed");
        };
    }
}
