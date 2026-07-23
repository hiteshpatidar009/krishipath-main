export class RequestTraceRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(entry) {
        await this.repository.create(entry);
    }
}
