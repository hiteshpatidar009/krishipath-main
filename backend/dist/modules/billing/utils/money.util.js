export class MoneyUtil {
    static add(left, right) {
        return MoneyUtil.fromCents(MoneyUtil.toCents(left) + MoneyUtil.toCents(right));
    }
    static subtract(left, right) {
        return MoneyUtil.fromCents(MoneyUtil.toCents(left) - MoneyUtil.toCents(right));
    }
    static min(left, right) {
        return MoneyUtil.toCents(left) <= MoneyUtil.toCents(right) ? left : right;
    }
    static isNegative(value) {
        return MoneyUtil.toCents(value) < 0;
    }
    static isZero(value) {
        return MoneyUtil.toCents(value) === 0;
    }
    static compare(left, right) {
        return MoneyUtil.toCents(left) - MoneyUtil.toCents(right);
    }
    static toCents(value) {
        return Math.round(Number(value) * 100);
    }
    static fromCents(cents) {
        return (cents / 100).toFixed(2);
    }
}
