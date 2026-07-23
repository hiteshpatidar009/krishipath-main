export interface StateTransition<TState extends string> {
  readonly from: TState;
  readonly to: TState;
  readonly event: string;
}

export class StateMachine<TState extends string> {
  private readonly transitions: readonly StateTransition<TState>[];

  constructor(transitions: readonly StateTransition<TState>[]) {
    this.transitions = transitions;
  }

  public canTransition(from: TState, to: TState, event: string): boolean {
    return this.transitions.some(
      (transition) =>
        transition.from === from &&
        transition.to === to &&
        transition.event === event,
    );
  }

  public transition(from: TState, to: TState, event: string): TState {
    if (!this.canTransition(from, to, event)) {
      throw new Error(`Invalid state transition: ${from} -> ${to}`);
    }

    return to;
  }
}
