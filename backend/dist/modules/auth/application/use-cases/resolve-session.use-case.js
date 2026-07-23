export class ResolveSessionUseCase {
    tokenVerifier;
    constructor(tokenVerifier) {
        this.tokenVerifier = tokenVerifier;
    }
    execute(accessToken) {
        const session = this.tokenVerifier.verifyAccess(accessToken);
        if (!session) {
            throw new Error("Invalid access token");
        }
        return session;
    }
}
