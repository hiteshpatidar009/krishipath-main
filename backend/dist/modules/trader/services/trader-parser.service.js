import { BaseService } from "../../../core/base/base.service";
export class TraderParserService extends BaseService {
    dictionaryService;
    constructor(dictionaryService) {
        super("TraderParserService");
        this.dictionaryService = dictionaryService;
    }
    /**
     * Parses a raw text message from a trader into structured items using regex and profile rules.
     * In a real implementation, this would use the trader's profile to adapt the parsing logic.
     */
    async parseRawMessage(rawText, parserProfile) {
        // Basic heuristic parser for demonstration:
        // E.g., "Onion Super 1500-2000 Avg 1800" or "Garlic Mota 5000"
        const lines = rawText.split('\n');
        const items = [];
        for (const line of lines) {
            if (!line.trim())
                continue;
            // Extremely simple regex to extract word parts and numbers
            const words = line.trim().split(/\s+/);
            const numbers = words.filter(w => /^\d+(-\d+)?$/.test(w));
            const textParts = words.filter(w => !/^\d+(-\d+)?$/.test(w));
            if (textParts.length > 0 && numbers.length > 0) {
                // Assume first word is product, second is grade (if exists)
                const productTerm = textParts[0];
                const gradeTerm = textParts.length > 1 ? textParts[1] : undefined;
                // Take the last number as the modal price (simplified)
                let priceStr = numbers[numbers.length - 1];
                if (priceStr.includes('-')) {
                    const parts = priceStr.split('-');
                    priceStr = parts[1]; // take max as modal for simplicity if range given
                }
                const pricePerQuintal = parseInt(priceStr, 10);
                items.push({ productTerm, gradeTerm, pricePerQuintal });
            }
        }
        return items;
    }
}
