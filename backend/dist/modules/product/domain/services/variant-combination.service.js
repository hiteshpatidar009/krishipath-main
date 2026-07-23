import { createHash } from "crypto";
export class VariantCombinationService {
    generate(productCode, attributes) {
        if (!attributes.length) {
            return [{
                    skuCode: this.slug(productCode),
                    variantCode: this.slug(productCode),
                    variantName: "Default",
                    attributes: {},
                }];
        }
        const normalized = attributes.map((attribute) => ({
            name: attribute.name.trim(),
            values: [...new Set(attribute.values.map((value) => value.trim()).filter(Boolean))],
        }));
        const invalid = normalized.find((attribute) => !attribute.name || !attribute.values.length);
        if (invalid) {
            throw new Error("Variant attributes require name and values");
        }
        const combinations = this.combine(normalized);
        return combinations.map((combination) => {
            const suffix = Object.values(combination).map((value) => this.slug(value)).join("-");
            const skuCode = `${this.slug(productCode)}-${suffix}`;
            return {
                skuCode,
                variantCode: skuCode,
                variantName: Object.entries(combination).map(([key, value]) => `${key}: ${value}`).join(", "),
                attributes: combination,
            };
        });
    }
    combine(attributes) {
        return attributes.reduce((current, attribute) => current.flatMap((combination) => attribute.values.map((value) => ({
            ...combination,
            [attribute.name]: value,
        }))), [{}]);
    }
    slug(value) {
        const slug = value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        return slug || createHash("sha1").update(value).digest("hex").slice(0, 8).toUpperCase();
    }
}
