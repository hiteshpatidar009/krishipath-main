export interface TestTelemetryEvent {
  readonly name: string;
  readonly moduleName: string;
  readonly durationMs: number;
  readonly status: "pass" | "fail" | "warning";
}

export class TestTelemetryBuffer {
  private readonly events: TestTelemetryEvent[] = [];

  public record(event: TestTelemetryEvent): void {
    this.events.push(event);
  }

  public flush(): readonly TestTelemetryEvent[] {
    return [...this.events];
  }
}
