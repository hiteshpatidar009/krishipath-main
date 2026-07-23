import { DeliveryDto } from "./delivery.dto";
import { MessageDto } from "./message.dto";

export interface IMessageProvider {
  send(message: MessageDto): Promise<DeliveryDto>;
}
