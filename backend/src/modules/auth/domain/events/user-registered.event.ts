import { DomainEvent } from "../../../../core";

export interface UserRegisteredPayload {
  readonly userId: string;
  readonly email: string;
}

export type UserRegisteredEvent = DomainEvent<UserRegisteredPayload>;
