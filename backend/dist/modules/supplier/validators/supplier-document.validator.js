import { z } from "zod";
export class UploadSupplierDocumentValidator {
    static schema = z.object({
        documentType: z.enum([
            "ASN",
            "INVOICE",
            "PACKING_LIST",
            "CERTIFICATE",
            "CONTRACT",
            "COMPLIANCE",
        ]),
        expiresAt: z.string().datetime().optional(),
    });
    static validate(input) {
        UploadSupplierDocumentValidator.schema.parse(input);
    }
    static parse(input) {
        return UploadSupplierDocumentValidator.schema.parse(input);
    }
}
