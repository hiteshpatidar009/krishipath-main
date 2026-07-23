import { randomUUID } from "crypto";
import axios from "axios";
import { env } from "../../../infrastructure/config/env";
import { AppError } from "../../../shared/errors/app.error";
export class StripePaymentGatewayService {
    async charge(request) {
        const secretKey = env.stripeSecretKey;
        if (!secretKey) {
            if (env.isEnvironmentProduction) {
                throw new AppError("Stripe secret key is not configured", 503, "STRIPE_SECRET_KEY_NOT_CONFIGURED");
            }
            return {
                gatewayPaymentId: `stripe_${randomUUID()}`,
                status: "SUCCEEDED",
                metadata: {
                    provider: "stripe",
                    invoiceId: request.invoiceId,
                    idempotencyKey: request.idempotencyKey,
                    mode: "stubbed_gateway_adapter",
                },
            };
        }
        if (!request.paymentMethodId) {
            return {
                gatewayPaymentId: `stripe_failed_${randomUUID()}`,
                status: "FAILED",
                failureReason: "Stripe payment method is required for direct charge",
                metadata: { provider: "stripe", mode: "payment_intent_missing_method" },
            };
        }
        const params = new URLSearchParams();
        params.set("amount", this.toMinorUnits(request.amount));
        params.set("currency", request.currencyCode.toLowerCase());
        params.set("payment_method", request.paymentMethodId);
        params.set("confirm", "true");
        params.set("off_session", "true");
        params.set("metadata[companyId]", request.companyId);
        params.set("metadata[invoiceId]", request.invoiceId);
        if (request.customerId) {
            params.set("customer", request.customerId);
        }
        const response = await axios.post(`${env.stripeApiBaseUrl}/payment_intents`, params, {
            auth: { username: secretKey, password: "" },
            timeout: env.externalHttpTimeoutMs,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                ...(request.idempotencyKey ? { "Idempotency-Key": request.idempotencyKey } : {}),
            },
            validateStatus: () => true,
        });
        const body = response.data;
        if (response.status >= 400 || body.error) {
            return {
                gatewayPaymentId: body.id ?? `stripe_failed_${randomUUID()}`,
                status: "FAILED",
                failureReason: body.error?.message ?? "Stripe payment failed",
                metadata: { provider: "stripe", mode: "payment_intent", stripeError: body.error },
            };
        }
        return {
            gatewayPaymentId: body.id ?? `stripe_${randomUUID()}`,
            status: body.status === "succeeded" ? "SUCCEEDED" : "FAILED",
            failureReason: body.status === "succeeded" ? undefined : `Stripe status ${body.status ?? "unknown"}`,
            metadata: {
                provider: "stripe",
                invoiceId: request.invoiceId,
                idempotencyKey: request.idempotencyKey,
                mode: "payment_intent",
                stripeStatus: body.status,
            },
        };
    }
    async refund(paymentId, amount, reason) {
        return {
            gatewayRefundId: `stripe_refund_${randomUUID()}`,
            status: paymentId && amount && reason ? "SUCCEEDED" : "FAILED",
        };
    }
    async createCheckoutSession(request) {
        const secretKey = env.stripeSecretKey;
        if (!secretKey) {
            if (env.isEnvironmentProduction) {
                throw new AppError("Stripe secret key is not configured", 503, "STRIPE_SECRET_KEY_NOT_CONFIGURED");
            }
            return {
                checkoutSessionId: `stripe_checkout_${randomUUID()}`,
                checkoutUrl: null,
                status: "PENDING",
                metadata: { provider: "stripe", mode: "stubbed_checkout_session" },
            };
        }
        const params = new URLSearchParams();
        const successUrl = env.stripeCheckoutSuccessUrl;
        const cancelUrl = env.stripeCheckoutCancelUrl;
        if (!successUrl || !cancelUrl) {
            if (env.isEnvironmentProduction) {
                throw new AppError("Stripe redirect URLs are not configured", 503, "STRIPE_REDIRECT_URLS_NOT_CONFIGURED");
            }
            return {
                checkoutSessionId: `stripe_checkout_${randomUUID()}`,
                checkoutUrl: null,
                status: "PENDING",
                metadata: { provider: "stripe", mode: "stubbed_checkout_session" },
            };
        }
        const amountMinor = Number(this.toMinorUnits(request.amount));
        const usesSetupMode = request.checkoutMode === "setup"
            || (request.checkoutMode !== "payment" && amountMinor <= 0);
        params.set("mode", usesSetupMode ? "setup" : "payment");
        params.set("success_url", successUrl.includes("{CHECKOUT_SESSION_ID}")
            ? successUrl
            : `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`);
        params.set("cancel_url", cancelUrl);
        if (!usesSetupMode) {
            params.set("line_items[0][quantity]", "1");
            params.set("line_items[0][price_data][currency]", request.currencyCode.toLowerCase());
            params.set("line_items[0][price_data][unit_amount]", amountMinor.toString());
            params.set("line_items[0][price_data][product_data][name]", request.planName);
        }
        params.set("metadata[companyId]", request.companyId);
        params.set("metadata[subscriptionId]", request.subscriptionId);
        for (const [key, value] of Object.entries(request.metadata)) {
            params.set(`metadata[${key}]`, value);
        }
        const checkoutPaymentMethodTypes = request.paymentMethodTypes.length > 0
            ? request.paymentMethodTypes
            : ["card"];
        checkoutPaymentMethodTypes.forEach((type, index) => {
            params.set(`payment_method_types[${index}]`, type);
        });
        if (request.customerId) {
            params.set("customer", request.customerId);
        }
        const response = await axios.post(`${env.stripeApiBaseUrl}/checkout/sessions`, params, {
            auth: { username: secretKey, password: "" },
            timeout: env.externalHttpTimeoutMs,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                ...(request.idempotencyKey ? { "Idempotency-Key": request.idempotencyKey } : {}),
            },
        });
        const body = response.data;
        return {
            checkoutSessionId: body.id,
            checkoutUrl: body.url ?? null,
            status: "PENDING",
            metadata: { provider: "stripe", mode: "checkout_session" },
        };
    }
    async createSetupIntent(request) {
        const secretKey = env.stripeSecretKey;
        if (!secretKey) {
            if (env.isEnvironmentProduction) {
                throw new AppError("Stripe secret key is not configured", 503, "STRIPE_SECRET_KEY_NOT_CONFIGURED");
            }
            return {
                setupIntentId: `stripe_setup_${randomUUID()}`,
                clientSecret: null,
                status: "PENDING",
                metadata: { provider: "stripe", mode: "stubbed_setup_intent" },
            };
        }
        const params = new URLSearchParams();
        params.set("usage", "off_session");
        params.set("metadata[companyId]", request.companyId);
        for (const [key, value] of Object.entries(request.metadata)) {
            params.set(`metadata[${key}]`, value);
        }
        request.paymentMethodTypes.forEach((type, index) => {
            params.set(`payment_method_types[${index}]`, type);
        });
        if (request.customerId) {
            params.set("customer", request.customerId);
        }
        const response = await axios.post(`${env.stripeApiBaseUrl}/setup_intents`, params, {
            auth: { username: secretKey, password: "" },
            timeout: env.externalHttpTimeoutMs,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                ...(request.idempotencyKey ? { "Idempotency-Key": request.idempotencyKey } : {}),
            },
        });
        const body = response.data;
        return {
            setupIntentId: body.id,
            clientSecret: body.client_secret ?? null,
            status: "PENDING",
            metadata: { provider: "stripe", mode: "setup_intent" },
        };
    }
    toMinorUnits(amount) {
        return Math.round(Number(amount) * 100).toString();
    }
}
