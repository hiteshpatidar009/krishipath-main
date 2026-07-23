export class PushDto {
    userId;
    title;
    message;
    companyId;
    data;
    constructor(input) {
        this.userId = input.userId;
        this.title = input.title;
        this.message = input.message;
        this.companyId = input.companyId;
        this.data = input.data;
    }
}
