export class InMemoryQueue {
    messages = [];
    async publish(message) {
        this.messages.push(message);
    }
    async consume(topic, limit) {
        return this.messages
            .filter((message) => message.topic === topic && message.availableAt <= new Date())
            .slice(0, limit);
    }
}
