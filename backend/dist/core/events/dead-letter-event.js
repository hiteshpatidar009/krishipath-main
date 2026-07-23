export class InMemoryDeadLetterStore {
    items = [];
    async save(deadLetter) {
        this.items.push(Object.freeze(deadLetter));
    }
    async list() {
        return [...this.items];
    }
}
