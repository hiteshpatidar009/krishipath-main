import { AuthSessionView } from "../../contracts";

export interface TokenVerifier {
  verifyAccess(token: string): AuthSessionView | null;
}

export class ResolveSessionUseCase {
  constructor(private readonly tokenVerifier: TokenVerifier) {}

  public execute(accessToken: string): AuthSessionView {
    const session = this.tokenVerifier.verifyAccess(accessToken);
    if (!session) {
      throw new Error("Invalid access token");
    }

    return session;
  }
}
