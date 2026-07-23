import {
  ApplicationLogRepository,
  LogWriteInput,
} from "./application-log.repository";

export class SystemLogRepository {
  constructor(private readonly repository: ApplicationLogRepository) {}

  public async create(entry: LogWriteInput): Promise<void> {
    await this.repository.create(entry);
  }
}
