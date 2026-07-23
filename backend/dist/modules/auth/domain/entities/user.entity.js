export class UserEntity {
    props;
    constructor(props) {
        this.props = props;
    }
    static rehydrate(props) {
        return new UserEntity(props);
    }
    get id() {
        return this.props.id;
    }
    get companyId() {
        return this.props.companyId;
    }
    get email() {
        return this.props.email.toString();
    }
    canAccessCoreFeatures() {
        return (Boolean(this.props.companyId) &&
            this.props.status === "active" &&
            this.props.isEmailVerified &&
            this.props.isMfaEnabled);
    }
}
