import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { Db2Connection } from "../../../infrastructure/database";
import { SqlResult } from "../../../shared/db/sql-result";
import { AppError } from "../../../shared/errors/app.error";
export class PostgresFinanceAccountingRepository {
    async createInvoice(input) {
        const invoiceId = randomUUID();
        const invoiceNumber = `${input.invoiceType === "customer" ? "INV" : "PINV"}-${Date.now()}`;
        const totals = this.totals(input.lines);
        await Db2Connection.getInstance().transaction(async (tx) => {
            await tx.execute(sql `
        INSERT INTO invoices (
          id, company_id, organization_id, invoice_type, sales_order_id, customer_id,
          supplier_id, purchase_order_id, goods_receipt_id, invoice_number,
          invoice_date, due_date, currency_code, subtotal, tax_amount,
          discount_amount, total_amount, paid_amount, outstanding_amount,
          invoice_status, notes, created_by, created_at, updated_at
        ) VALUES (
          ${invoiceId}, ${input.companyId}, ${input.organizationId ?? null}, ${input.invoiceType},
          null, ${input.customerId ?? null}, ${input.supplierId ?? null},
          ${input.purchaseOrderId ?? null}, ${input.goodsReceiptId ?? null},
          ${invoiceNumber}, ${input.invoiceDate}, ${input.dueDate}, ${input.currencyCode},
          ${totals.subtotal}, ${totals.taxAmount}, ${totals.discountAmount},
          ${totals.totalAmount}, 0, ${totals.totalAmount}, 'draft',
          ${input.notes ?? null}, ${input.createdBy}, NOW(), NOW()
        )
      `);
            for (const line of input.lines) {
                const lineSubtotal = line.quantity * line.unitPrice;
                const discount = line.discountAmount ?? 0;
                const taxable = Math.max(lineSubtotal - discount, 0);
                const taxAmount = line.taxType === "exempt" ? 0 : taxable * ((line.taxRate ?? 0) / 100);
                await tx.execute(sql `
          INSERT INTO invoice_line_items (
            id, company_id, invoice_id, product_id, product_variant_id, description,
            quantity, unit_price, discount_amount, tax_type, tax_rate, tax_amount, line_total, created_at
          ) VALUES (
            ${randomUUID()}, ${input.companyId}, ${invoiceId}, ${line.productId ?? null},
            ${line.productVariantId ?? null}, ${line.description}, ${line.quantity},
            ${line.unitPrice}, ${discount}, ${line.taxType ?? "gst"}, ${line.taxRate ?? 0},
            ${taxAmount}, ${taxable + taxAmount}, NOW()
          )
        `);
            }
            await this.createAccountingEvent(tx, input.companyId, "invoice_created", invoiceId, totals.totalAmount, input.createdBy);
        });
        return { invoiceId, invoiceNumber };
    }
    async updateInvoice(input) {
        await this.requireInvoice(input.companyId, input.invoiceId);
        await Db2Connection.getInstance().execute(sql `
      UPDATE invoices
      SET notes = COALESCE(${input.notes ?? null}, notes),
          due_date = COALESCE(${input.dueDate ?? null}, due_date),
          updated_at = NOW()
      WHERE company_id = ${input.companyId} AND id = ${input.invoiceId}
    `);
        return { invoiceId: input.invoiceId };
    }
    async listInvoices(query) {
        const filters = [
            sql `company_id = ${query.companyId}`,
            query.invoiceType ? sql `invoice_type = ${query.invoiceType}` : undefined,
            query.status ? sql `invoice_status = ${query.status}` : undefined,
        ].filter(Boolean);
        const where = sql.join(filters, sql ` AND `);
        const [total] = SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT count(*)::text AS total FROM invoices WHERE ${where}
    `));
        const items = SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT * FROM invoices
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}
    `));
        return { items, total: Number(total?.total ?? 0) };
    }
    async getInvoice(companyId, invoiceId) {
        const [invoice] = SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT i.*,
        COALESCE(json_agg(DISTINCT ili.*) FILTER (WHERE ili.id IS NOT NULL), '[]') AS lines,
        COALESCE(json_agg(DISTINCT p.*) FILTER (WHERE p.id IS NOT NULL), '[]') AS payments
      FROM invoices i
      LEFT JOIN invoice_line_items ili ON ili.invoice_id = i.id
      LEFT JOIN payments p ON p.invoice_id = i.id
      WHERE i.company_id = ${companyId} AND i.id = ${invoiceId}
      GROUP BY i.id
    `));
        return invoice ?? null;
    }
    async approveInvoice(input) {
        return this.setStatus(input, "approved", "invoice_approved");
    }
    async sendInvoice(input) {
        return this.setStatus(input, "sent", "invoice_sent");
    }
    async cancelInvoice(input) {
        return this.setStatus(input, "cancelled", "invoice_cancelled");
    }
    async recordPayment(input) {
        const invoice = await this.requireInvoice(input.companyId, input.invoiceId);
        const outstanding = Number(invoice.outstanding_amount ?? 0);
        if (input.amount > outstanding) {
            throw new AppError("Payment exceeds outstanding invoice amount", 400, "PAYMENT_EXCEEDS_OUTSTANDING");
        }
        const paymentId = randomUUID();
        const nextPaid = Number(invoice.paid_amount ?? 0) + input.amount;
        const nextOutstanding = Math.max(outstanding - input.amount, 0);
        const status = nextOutstanding === 0 ? "paid" : "partially_paid";
        await Db2Connection.getInstance().transaction(async (tx) => {
            await tx.execute(sql `
        INSERT INTO payments (
          id, company_id, invoice_id, payment_method, payment_reference,
          currency_code, amount, payment_status, paid_at, recorded_by, created_at
        ) VALUES (
          ${paymentId}, ${input.companyId}, ${input.invoiceId}, ${input.paymentMethod},
          ${input.paymentReference}, ${invoice.currency_code ?? "INR"}, ${input.amount},
          'recorded', ${input.paidAt ?? new Date().toISOString()}, ${input.actorId}, NOW()
        )
      `);
            await tx.execute(sql `
        INSERT INTO payment_allocations (
          id, company_id, payment_id, invoice_id, allocated_amount, created_at
        ) VALUES (
          ${randomUUID()}, ${input.companyId}, ${paymentId}, ${input.invoiceId}, ${input.amount}, NOW()
        )
      `);
            await tx.execute(sql `
        UPDATE invoices
        SET paid_amount = ${nextPaid},
            outstanding_amount = ${nextOutstanding},
            invoice_status = ${status},
            updated_at = NOW()
        WHERE company_id = ${input.companyId} AND id = ${input.invoiceId}
      `);
            await this.createAccountingEvent(tx, input.companyId, "payment_recorded", input.invoiceId, input.amount, input.actorId);
        });
        return { paymentId, invoiceStatus: status };
    }
    async chartOfAccounts(companyId) {
        return SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT * FROM chart_of_accounts
      WHERE company_id = ${companyId} OR company_id IS NULL
      ORDER BY account_code
    `));
    }
    async accountingEvents(companyId) {
        return SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT * FROM accounting_events
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT 200
    `));
    }
    async arSummary(companyId) {
        return this.summary(companyId, "customer");
    }
    async apSummary(companyId) {
        return this.summary(companyId, "purchase");
    }
    async summary(companyId, invoiceType) {
        const [row] = SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT count(*)::int AS total_invoices,
             COALESCE(sum(total_amount), 0)::numeric AS total_amount,
             COALESCE(sum(paid_amount), 0)::numeric AS paid_amount,
             COALESCE(sum(outstanding_amount), 0)::numeric AS outstanding_amount
      FROM invoices
      WHERE company_id = ${companyId} AND invoice_type = ${invoiceType}
    `));
        return row ?? {};
    }
    async setStatus(input, status, eventType) {
        const invoice = await this.requireInvoice(input.companyId, input.invoiceId);
        await Db2Connection.getInstance().transaction(async (tx) => {
            await tx.execute(sql `
        UPDATE invoices
        SET invoice_status = ${status}, notes = COALESCE(${input.notes ?? null}, notes), updated_at = NOW()
        WHERE company_id = ${input.companyId} AND id = ${input.invoiceId}
      `);
            await this.createAccountingEvent(tx, input.companyId, eventType, input.invoiceId, Number(invoice.total_amount ?? 0), input.actorId);
        });
        return { invoiceId: input.invoiceId, status };
    }
    async requireInvoice(companyId, invoiceId) {
        const [invoice] = SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT * FROM invoices
      WHERE company_id = ${companyId} AND id = ${invoiceId}
      LIMIT 1
    `));
        if (!invoice) {
            throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
        }
        return invoice;
    }
    totals(lines) {
        return lines.reduce((acc, line) => {
            const subtotal = line.quantity * line.unitPrice;
            const discount = line.discountAmount ?? 0;
            const taxable = Math.max(subtotal - discount, 0);
            const taxAmount = line.taxType === "exempt" ? 0 : taxable * ((line.taxRate ?? 0) / 100);
            return {
                subtotal: acc.subtotal + subtotal,
                discountAmount: acc.discountAmount + discount,
                taxAmount: acc.taxAmount + taxAmount,
                totalAmount: acc.totalAmount + taxable + taxAmount,
            };
        }, { subtotal: 0, discountAmount: 0, taxAmount: 0, totalAmount: 0 });
    }
    async createAccountingEvent(tx, companyId, eventType, sourceId, amount, createdBy) {
        await tx.execute(sql `
      INSERT INTO accounting_events (
        id, company_id, event_type, source_type, source_id, amount,
        status, created_by, created_at
      ) VALUES (
        ${randomUUID()}, ${companyId}, ${eventType}, 'invoice', ${sourceId},
        ${amount}, 'pending_journal', ${createdBy}, NOW()
      )
    `);
    }
}
