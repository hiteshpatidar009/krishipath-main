export class StateMachine {
    transitions;
    constructor(transitions) {
        this.transitions = transitions;
    }
    canTransition(from, to, event) {
        return this.transitions.some((transition) => transition.from === from &&
            transition.to === to &&
            transition.event === event);
    }
    transition(from, to, event) {
        if (!this.canTransition(from, to, event)) {
            throw new Error(`Invalid state transition: ${from} -> ${to}`);
        }
        return to;
    }
}
