export class AuthError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.name = "AuthError";
        this.code = code;
    }
}
