export function percentile(values, fraction) {
    if (!values.length) {
        return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}
export function average(values) {
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}
