export interface ScheduledTask {
  readonly name: string;
  readonly intervalMs: number;
  run(): Promise<void>;
}

export class SchedulerService {
  private readonly timers: NodeJS.Timeout[] = [];

  public register(task: ScheduledTask): void {
    const timer = setInterval(() => {
      void task.run();
    }, task.intervalMs);
    this.timers.push(timer);
  }

  public stop(): void {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
  }
}
