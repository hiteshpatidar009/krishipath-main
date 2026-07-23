export class TestTelemetryBuffer {
    events = [];
    record(event) {
        this.events.push(event);
    }
    flush() {
        return [...this.events];
    }
}
