export class Email {
    value;
    constructor(value) {
        this.value = value;
    }
    static create(rawValue) {
        const normalized = rawValue.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
            throw new Error("Invalid email address");
        }
        return new Email(normalized);
    }
    toString() {
        return this.value;
    }
}
