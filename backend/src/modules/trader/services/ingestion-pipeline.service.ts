import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
import { IngestionPipelineRepository } from "../repositories/ingestion.repository";
import { TraderParserService } from "./trader-parser.service";
import { UniversalConceptDictionaryService } from "../../localization/services/dictionary.service";
import { MandiPriceService } from "../../mandi/services/mandi-price.service";

export class IngestionPipelineService extends BaseService {
  constructor(
    private readonly ingestionRepo: IngestionPipelineRepository,
    private readonly parserService: TraderParserService,
    private readonly dictionaryService: UniversalConceptDictionaryService,
    private readonly mandiPriceService: MandiPriceService
  ) {
    super("IngestionPipelineService");
  }

  public async processRawMessage(input: {
    sourceIdentifier: string;
    sourceType: string;
    rawText: string;
    receivedAt: Date;
    mandiId: string; // The mandi context for this message
  }) {
    const feedSource = await this.ingestionRepo.getFeedSource(input.sourceIdentifier, input.sourceType);
    if (!feedSource) {
      throw new AppError("Unregistered feed source", 403);
    }

    // 1. Store Raw Message (Audit/Replay purposes)
    const rawMessage = await this.ingestionRepo.saveRawMessage({
      feedSourceId: feedSource.id,
      rawText: input.rawText,
      receivedAt: input.receivedAt,
      status: "PENDING",
      parserVersion: "v1.0"
    });

    try {
      const traderProfile = await this.ingestionRepo.getTraderParserProfile(feedSource.traderId);

      // 2. Parse Raw Text to Structured Items
      const parsedItems = await this.parserService.parseRawMessage(input.rawText, traderProfile);
      
      const validationErrors: string[] = [];
      let successCount = 0;

      // 3. Validate & Map using Concept Dictionary
      for (const item of parsedItems) {
        // Resolve canonical Product ID
        const productId = await this.dictionaryService.resolveTerm(item.productTerm, "PRODUCT");
        if (!productId) {
          validationErrors.push(`Unrecognized product term: ${item.productTerm}`);
          continue;
        }

        // Resolve canonical Variant ID (Grade)
        let variantId = productId; // Fallback to product if no grade specified
        if (item.gradeTerm) {
          const resolvedVariant = await this.dictionaryService.resolveTerm(item.gradeTerm, "VARIANT");
          if (resolvedVariant) {
            variantId = resolvedVariant;
          } else {
            validationErrors.push(`Unrecognized grade term: ${item.gradeTerm} for product ${item.productTerm}`);
            // Could still proceed with fallback variant if allowed by business rules
          }
        }

        // 4. Save to Trader Price History
        await this.mandiPriceService.updateTraderPrice(
          feedSource.traderId, // user doing the update
          input.mandiId,
          variantId,
          item.pricePerQuintal.toString(),
          feedSource.traderId, // setBy
          input.receivedAt.toISOString().split("T")[0] // date string
        );
        successCount++;
      }

      // 5. Update Raw Message Status
      const finalStatus = successCount === 0 ? "VALIDATION_FAILED" : (validationErrors.length > 0 ? "PARTIAL_SUCCESS" : "PARSED");
      await this.ingestionRepo.updateRawMessageStatus(rawMessage.id, finalStatus, parsedItems, validationErrors);

      return {
        messageId: rawMessage.id,
        status: finalStatus,
        parsedCount: parsedItems.length,
        successCount,
        errors: validationErrors
      };

    } catch (error: any) {
      await this.ingestionRepo.updateRawMessageStatus(rawMessage.id, "REJECTED", null, [error.message]);
      throw error;
    }
  }
}
