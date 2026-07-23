import { Email } from "../value-objects/email.vo";

export type UserAccessStatus = "restricted" | "active" | "suspended";

export interface UserProps {
  readonly id: string;
  readonly companyId?: string;
  readonly email: Email;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: UserAccessStatus;
  readonly isEmailVerified: boolean;
  readonly isMfaEnabled: boolean;
}

export class UserEntity {
  private constructor(private readonly props: UserProps) {}

  public static rehydrate(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get companyId(): string | undefined {
    return this.props.companyId;
  }

  public get email(): string {
    return this.props.email.toString();
  }

  public canAccessCoreFeatures(): boolean {
    return (
      Boolean(this.props.companyId) &&
      this.props.status === "active" &&
      this.props.isEmailVerified &&
      this.props.isMfaEnabled
    );
  }
}
