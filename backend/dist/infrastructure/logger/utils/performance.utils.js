export class PerformanceUtils {
    static now() {
        return Date.now();
    }
    static duration(startedAt) {
        return Date.now() - startedAt;
    }
}
