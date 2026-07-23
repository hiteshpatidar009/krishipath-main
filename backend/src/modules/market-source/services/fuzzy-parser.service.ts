import { BaseService } from "../../../core/base/base.service";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { productsTable } from "../../../infrastructure/database/postgres/schemas/db1";
import Fuse from "fuse.js";
import { eq } from "drizzle-orm";
import { DEFAULT_CROP_TRANSLATIONS } from "../../../shared/constants/crop-translations";

type DictionaryEntry = { productId: string; cropName: string; term: string };
type ParsedPrice = {
  productId: string;
  cropName: string;
  variantName: string;
  minPrice: number;
  maxPrice: number;
  unit: string;
  isAverage?: boolean;
};

export class FuzzyMessageParserService extends BaseService {
  constructor() {
    super("FuzzyMessageParserService");
  }

  public async parseRawMessage(rawText: string, profile?: any) {
    const db = Db1Connection.getInstance();
    
    // Fetch crops
    let productsQuery = db.select({
      id: productsTable.id,
      name: productsTable.name,
      aliases: productsTable.aliases,
    }).from(productsTable);
    
    const products = await productsQuery;

    const dictionary: DictionaryEntry[] = [];
    const supportedCropIds = profile?.supportedCrops || null;

    products.forEach(p => {
      // If profile restricts crops, skip if not in supported list
      if (supportedCropIds && Array.isArray(supportedCropIds) && supportedCropIds.length > 0) {
        if (!supportedCropIds.includes(p.id)) return;
      }

      dictionary.push({ productId: p.id, cropName: p.name, term: p.name });
      
      const aliases = Array.isArray(p.aliases) ? p.aliases : (typeof p.aliases === 'string' ? JSON.parse(p.aliases) : []);
      for (const alias of aliases) {
        if (alias) {
          dictionary.push({ productId: p.id, cropName: p.name, term: alias });
        }
      }

      // Add mapped aliases from profile
      if (profile?.mappedAliases && typeof profile.mappedAliases === 'object') {
        const localName = Object.keys(profile.mappedAliases).find(key => profile.mappedAliases[key] === p.id);
        if (localName) {
          dictionary.push({ productId: p.id, cropName: p.name, term: localName });
        }
      }

      // Hardcoded fallback translations for common crops
      if (DEFAULT_CROP_TRANSLATIONS[p.name]) {
        for (const t of DEFAULT_CROP_TRANSLATIONS[p.name]) {
          dictionary.push({ productId: p.id, cropName: p.name, term: t });
        }
      }
    });

    const fuse = new Fuse(dictionary, {
      keys: ["term"],
      includeScore: true,
      threshold: 0.3,
    });

    // Normalize text
    const lines = rawText.split('\n').map(l => l.trim().toLowerCase()).filter(l => l.length > 0);
    const parsedPrices: ParsedPrice[] = [];

    const defaultUnit = profile?.defaultUnit || 'Qtl';

    // If template exists, use it (assumed regex for simplicity, e.g. "(?<crop>[a-z]+) (?<min>\d+) (?<max>\d+)")
    // For now, if no template or template fails, fallback to fuzzy
    for (const line of lines) {
      if (profile?.messageTemplate) {
        try {
          const regex = new RegExp(profile.messageTemplate, 'i');
          const match = line.match(regex);
          if (match && match.groups && match.groups.crop) {
            const cropTerm = match.groups.crop;
            const minPrice = parseInt(match.groups.min || '0', 10);
            const maxPrice = parseInt(match.groups.max || match.groups.min || '0', 10);
            
            // Match cropTerm to product
            const results = fuse.search(cropTerm);
            if (results.length > 0) {
               parsedPrices.push({
                 productId: results[0].item.productId,
                 cropName: results[0].item.cropName,
                 variantName: match.groups.grade || 'Base',
                 minPrice,
                 maxPrice,
                 unit: defaultUnit
               });
               continue;
            }
          }
        } catch(e) {
          // invalid regex template, fallback
        }
      }

      // Fallback: Fuzzy + Heuristic
      let cleanLine = line.replace(/[*_~`🧅]/g, ' ').toLowerCase();
      
      // Sanitize: Remove arrival quantities to avoid confusing them with prices
      cleanLine = cleanLine.replace(/(?:आवक|arrival|qty|quantity)[\s\-:=]*\d+\+?[\s]*(?:कट्टे|bori|bags|bag|motor|vehicles|vahan)?/g, '');
      cleanLine = cleanLine.replace(/\d+\+?[\s]*(?:कट्टे|bori|bags|bag|motor|vehicles|vahan)/g, '');
      
      const numbers = cleanLine.match(/\b\d{3,5}\b/g);
      
      const words = cleanLine.split(/[\s,]+/);
      let matchedCrop = null;

      for (const word of words) {
        if (/^\d/.test(word)) continue;
        const results = fuse.search(word);
        if (results.length > 0 && results[0].score! < 0.3) {
          matchedCrop = results[0].item;
          break; // found a crop in this line
        }
      }

      let activeCrop = null;
      if (matchedCrop) {
        activeCrop = matchedCrop;
        // set as state context for subsequent lines
        (this as any).currentCropContext = activeCrop;
      } else if ((this as any).currentCropContext) {
        activeCrop = (this as any).currentCropContext;
      }

      // Detect Variants if we have an active crop and numbers
      if (activeCrop && numbers && numbers.length > 0) {
        let variantName = 'Base';
        let isAverage = false;

        // Hardcoded generic dictionary for Hindi/English grading terms common in Mandis
        const variantKeywords = [
          { terms: ['extra super', 'exra super', 'स्टॉक क्वालिटी', 'एक्स्ट्रा सुपर'], canonical: 'Extra Super' },
          { terms: ['super', 'सुपर', 'supr'], canonical: 'Super' },
          { terms: ['average', 'avrage', 'एवरेज', 'evrej'], canonical: 'Average', isAverage: true },
          { terms: ['golta', 'गोल्टा', 'goltha'], canonical: 'Golta' },
          { terms: ['golti', 'गोल्टी', 'golthi'], canonical: 'Golti' },
          { terms: ['medium', 'मिडियम', 'मीडियम'], canonical: 'Medium' },
          { terms: ['halka', 'हल्का', 'low'], canonical: 'Low' }
        ];

        // Search for variant in the line
        for (const vk of variantKeywords) {
          if (vk.terms.some(t => cleanLine.includes(t))) {
            variantName = vk.canonical;
            isAverage = !!vk.isAverage;
            break;
          }
        }

        let minPrice = 0;
        let maxPrice = 0;

        if (numbers.length >= 2) {
          const n1 = parseInt(numbers[0], 10);
          const n2 = parseInt(numbers[1], 10);
          minPrice = Math.min(n1, n2);
          maxPrice = Math.max(n1, n2);
        } else if (numbers.length === 1) {
          minPrice = parseInt(numbers[0], 10);
          maxPrice = minPrice;
        }

        // Avoid impossibly low prices (e.g. quantities misidentified)
        if (minPrice > 100) {
          parsedPrices.push({
            productId: activeCrop.productId,
            cropName: activeCrop.cropName,
            variantName,
            isAverage,
            minPrice,
            maxPrice,
            unit: defaultUnit
          });
        }
      }
    }

    // Post-processing: Group by crop, and emit the final list.
    // If a crop has variants, we extract the "Average" variant to be the "Base" price for overall dashboard viewing.
    const groupedByCrop: Record<string, ParsedPrice[]> = {};
    for (const p of parsedPrices) {
      if (!groupedByCrop[p.productId]) groupedByCrop[p.productId] = [];
      groupedByCrop[p.productId].push(p);
    }

    const finalPrices: ParsedPrice[] = [];
    for (const [pid, pricesList] of Object.entries(groupedByCrop)) {
      const avgVariant = pricesList.find(p => p.isAverage) || pricesList.find(p => p.variantName.toLowerCase().includes('average'));
      const explicitBase = pricesList.find(p => p.variantName === 'Base');
      
      let baseMin = 0;
      let baseMax = 0;
      
      if (avgVariant) {
        baseMin = avgVariant.minPrice;
        baseMax = avgVariant.maxPrice;
      } else if (explicitBase) {
        baseMin = explicitBase.minPrice;
        baseMax = explicitBase.maxPrice;
      } else {
        // Calculate overall min and max from all variants
        baseMin = Math.min(...pricesList.map(p => p.minPrice));
        baseMax = Math.max(...pricesList.map(p => p.maxPrice));
      }
      
      const firstP = pricesList[0];
      finalPrices.push({
        productId: firstP.productId,
        cropName: firstP.cropName,
        variantName: 'Base',
        minPrice: baseMin,
        maxPrice: baseMax,
        unit: firstP.unit
      });

      // Add the remaining variants
      for (const p of pricesList) {
        // Skip the one we used for Base (so we don't duplicate it as a variant)
        if (p === avgVariant || p === explicitBase) continue;
        
        finalPrices.push({
          productId: p.productId,
          cropName: p.cropName,
          variantName: p.variantName,
          minPrice: p.minPrice,
          maxPrice: p.maxPrice,
          unit: p.unit
        });
      }
    }

    // Deduplicate exact matches just in case
    const uniquePrices: ParsedPrice[] = [];
    const seen = new Set<string>();
    for (const p of finalPrices) {
      const key = `${p.productId}-${p.variantName}`;
      if (!seen.has(key)) {
        seen.add(key);
        // Clean up internal flags
        delete p.isAverage;
        uniquePrices.push(p);
      }
    }

    return {
      prices: uniquePrices
    };
  }
}
