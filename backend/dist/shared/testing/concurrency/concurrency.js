export async function runParallel(count, runner) {
    return Promise.all(Array.from({ length: count }, (_, index) => runner(index)));
}
export function hasSingleResult(values) {
    return new Set(values).size === 1;
}
