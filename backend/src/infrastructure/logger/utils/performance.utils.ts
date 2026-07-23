export class PerformanceUtils {
  public static now(): number {
    return Date.now();
  }

  public static duration(startedAt: number): number {
    return Date.now() - startedAt;
  }
}
