export class DeliveryDto {
    messageId;
    status;
    constructor(messageId, status) {
        this.messageId = messageId;
        this.status = status;
    }
}
