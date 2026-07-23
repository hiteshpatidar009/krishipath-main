import axios from "axios";
import { randomUUID } from "crypto";
import { DeliveryDto } from "./delivery.dto";
import { IMessageProvider } from "./message-provider.interface";
import { MessageDto } from "./message.dto";
import { env } from "../../infrastructure/config/env";

export class HttpMessageProvider implements IMessageProvider {
  constructor(
    private readonly endpointUrl: string,
    private readonly apiKey: string,
  ) {}

  public async send(message: MessageDto): Promise<DeliveryDto> {
    const response = await axios.post(
      this.endpointUrl,
      message,
      {
        timeout: env.externalHttpTimeoutMs,
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
      },
    );

    const data = response.data as { messageId?: string; id?: string };
    return new DeliveryDto(data.messageId ?? data.id ?? randomUUID(), "sent");
  }
}
