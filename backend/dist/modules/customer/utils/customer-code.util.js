export class CustomerCodeUtil {
    static normalize(value) {
        return value.trim().toUpperCase();
    }
    static buildPortalReference(customerCode) {
        return `CUST-${CustomerCodeUtil.normalize(customerCode)}`;
    }
}
