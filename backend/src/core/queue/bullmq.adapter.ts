import { Queue } from "bullmq";
import { QueueMessage, QueuePort } from "./queue.port";
import { RedisConnection } from "../../infrastructure/database/redis/redis.connection";

export class BullMQAdapter implements QueuePort {
  private readonly queues: Map<string, Queue> = new Map();

  private getQueue(topic: string): Queue {
    if (!this.queues.has(topic)) {
      const redisClient = RedisConnection.getInstance();
      const queue = new Queue(topic, { connection: redisClient as any });
      this.queues.set(topic, queue);
    }
    return this.queues.get(topic)!;
  }

  public async publish<TPayload>(message: QueueMessage<TPayload>): Promise<void> {
    const queue = this.getQueue(message.topic);
    const delay = Math.max(0, message.availableAt.getTime() - Date.now());
    
    await queue.add(message.topic, message.payload, {
      jobId: message.id,
      delay,
    });
  }

  public async consume(topic: string, limit: number): Promise<readonly QueueMessage[]> {
    throw new Error("BullMQ uses Workers to consume, do not use consume() method directly. Configure a Worker instead.");
  }
}
