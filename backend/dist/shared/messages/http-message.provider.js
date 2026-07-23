import axios from "axios";
import { randomUUID } from "crypto";
import { DeliveryDto } from "./delivery.dto";
import { env } from "../../infrastructure/config/env";
export class HttpMessageProvider {
    endpointUrl;
    apiKey;
    constructor(endpointUrl, apiKey) {
        this.endpointUrl = endpointUrl;
        this.apiKey = apiKey;
    }
    async send(message) {
        const response = await axios.post(this.endpointUrl, message, {
            timeout: env.externalHttpTimeoutMs,
            headers: {
                authorization: `Bearer ${this.apiKey}`,
                "content-type": "application/json",
            },
        });
        const data = response.data;
        return new DeliveryDto(data.messageId ?? data.id ?? randomUUID(), "sent");
    }
}
