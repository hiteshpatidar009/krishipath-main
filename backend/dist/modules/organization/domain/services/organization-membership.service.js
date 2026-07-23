export class OrganizationMembershipService {
    canAssignRole(actorUserId, targetUserId) {
        return Boolean(actorUserId && targetUserId);
    }
}
