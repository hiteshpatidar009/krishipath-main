export abstract class BaseService {
  protected serviceName: string;

  protected constructor(serviceName: string) {
    this.serviceName = serviceName;
  }
}
