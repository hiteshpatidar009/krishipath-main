import { performance } from "perf_hooks";
export async function measureDuration(runner) {
    const started = performance.now();
    const value = await runner();
    return {
        value,
        durationMs: performance.now() - started,
    };
}
