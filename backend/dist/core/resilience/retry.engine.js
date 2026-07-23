export class RetryEngine {
    async execute(operation, options) {
        let lastError;
        for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === options.attempts) {
                    break;
                }
                await this.delay(this.delayMs(attempt, options));
            }
        }
        throw lastError;
    }
    delayMs(attempt, options) {
        const exponential = options.baseDelayMs * 2 ** (attempt - 1);
        return Math.min(exponential, options.maxDelayMs ?? exponential);
    }
    async delay(ms) {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
