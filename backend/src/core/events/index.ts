import { EventBus } from "./event-bus";
import { EventDispatcher } from "./event-dispatcher";
import { InMemoryDeadLetterStore } from "./dead-letter-event";

export * from "./dead-letter-event";
export * from "./domain-event";
export * from "./event-bus";
export * from "./event-dispatcher";
export * from "./event-envelope";
export * from "./event-handler";
export * from "./integration-event";
export * from "./outbox-event-store";
export * from "./postgres-outbox-event-store";
export * from "./transactional-event-publisher";

export const CoreEventBus = new EventBus();
export const CoreDeadLetterStore = new InMemoryDeadLetterStore();
export const CoreEventDispatcher = new EventDispatcher(
  CoreEventBus,
  CoreDeadLetterStore,
);
