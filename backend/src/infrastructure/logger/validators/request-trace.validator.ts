export class RequestTraceValidator {
  public static validateRequestId(requestId?: string): void {
    if (!requestId) {
      return;
    }

    if (requestId.length > 200) {
      throw new Error("requestId length exceeded");
    }
  }
}
