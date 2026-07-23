import { BillingCycle } from "../constants/billing.constants";
export class BillingDateUtil {
    static addBillingCycle(date, billingCycle) {
        const next = new Date(date);
        if (billingCycle === BillingCycle.Yearly || billingCycle === BillingCycle.Annual) {
            next.setFullYear(next.getFullYear() + 1);
            return next;
        }
        if (billingCycle === BillingCycle.Quarterly) {
            next.setMonth(next.getMonth() + 3);
            return next;
        }
        next.setMonth(next.getMonth() + 1);
        return next;
    }
    static addDays(date, days) {
        const next = new Date(date);
        next.setDate(next.getDate() + days);
        return next;
    }
    static addHours(date, hours) {
        const next = new Date(date);
        next.setHours(next.getHours() + hours);
        return next;
    }
}
