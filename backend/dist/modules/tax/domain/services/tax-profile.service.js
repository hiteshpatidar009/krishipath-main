export class TaxProfileService {
    findOwnerProfile(profiles, ownerType, ownerId) {
        if (!ownerId)
            return null;
        return profiles.find((profile) => profile.ownerType === ownerType && profile.ownerId === ownerId) ?? null;
    }
}
