import { TAX_EVENTS } from "../../events";
export class AssignTaxProfileUseCase {
    repository;
    events;
    constructor(repository, events) {
        this.repository = repository;
        this.events = events;
    }
    async execute(dto, context) {
        const profile = await this.repository.upsertProfile({
            ...dto,
            companyId: context.companyId,
            organizationId: dto.organizationId ?? context.organizationId ?? null,
        });
        await this.events.publish(TAX_EVENTS.ProfileUpdated, { profile }, context);
        return profile;
    }
}
