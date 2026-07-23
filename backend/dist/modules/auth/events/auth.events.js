export class AuthEvents {
    static loginSucceeded(userId, metadata) {
        return {
            name: "auth.login.succeeded",
            userId,
            occurredAt: new Date().toISOString(),
            metadata,
        };
    }
}
