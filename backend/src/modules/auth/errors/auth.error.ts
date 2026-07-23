export class AuthError extends Error {
  public readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}
