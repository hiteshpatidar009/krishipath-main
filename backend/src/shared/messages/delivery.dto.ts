export class DeliveryDto {
  public readonly messageId: string;
  public readonly status: "accepted" | "sent";

  constructor(messageId: string, status: "accepted" | "sent") {
    this.messageId = messageId;
    this.status = status;
  }
}
