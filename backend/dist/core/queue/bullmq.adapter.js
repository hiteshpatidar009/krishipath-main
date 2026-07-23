import { Queue } from "bullmq";
import { RedisConnection } from "../../infrastructure/database/redis/redis.connection";
export class BullMQAdapter {
    queues = new Map();
    getQueue(topic) {
        if (!this.queues.has(topic)) {
            const redisClient = RedisConnection.getInstance();
            const queue = new Queue(topic, { connection: redisClient });
            this.queues.set(topic, queue);
        }
        return this.queues.get(topic);
    }
    async publish(message) {
        const queue = this.getQueue(message.topic);
        const delay = Math.max(0, message.availableAt.getTime() - Date.now());
        await queue.add(message.topic, message.payload, {
            jobId: message.id,
            delay,
        });
    }
    async consume(topic, limit) {
        throw new Error("BullMQ uses Workers to consume, do not use consume() method directly. Configure a Worker instead.");
    }
}
