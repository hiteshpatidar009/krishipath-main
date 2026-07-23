export class SchedulerService {
    timers = [];
    register(task) {
        const timer = setInterval(() => {
            void task.run();
        }, task.intervalMs);
        this.timers.push(timer);
    }
    stop() {
        for (const timer of this.timers) {
            clearInterval(timer);
        }
    }
}
