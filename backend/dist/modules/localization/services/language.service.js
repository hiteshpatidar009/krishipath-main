import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
export class LanguageService extends BaseService {
    languageRepo;
    constructor(languageRepo) {
        super("LanguageService");
        this.languageRepo = languageRepo;
    }
    async listAll(activeOnly = false) {
        return this.languageRepo.findAll(activeOnly);
    }
    async getByCode(code) {
        const lang = await this.languageRepo.findByCode(code);
        if (!lang)
            throw new AppError(`Language '${code}' not found`, 404);
        return lang;
    }
    async create(data) {
        const existing = await this.languageRepo.findByCode(data.code);
        if (existing) {
            throw new AppError(`Language with code '${data.code}' already exists`, 409);
        }
        // If setting as default, clear existing default first
        if (data.isDefault) {
            await this.languageRepo.clearDefault();
        }
        const id = randomUUID();
        return this.languageRepo.create({ id, ...data });
    }
    async update(id, data) {
        const existing = await this.languageRepo.findById(id);
        if (!existing)
            throw new AppError("Language not found", 404);
        // If setting as default, clear existing default first
        if (data.isDefault) {
            await this.languageRepo.clearDefault();
        }
        return this.languageRepo.update(id, data);
    }
    /**
     * Resolve the best language code from priority chain.
     * Priority: explicit header → user profile lang → default
     */
    async resolveLanguageCode(acceptLanguageHeader, userPreferredLang) {
        const defaultLang = "en";
        // Try explicit Accept-Language header first
        if (acceptLanguageHeader) {
            const candidates = this.parseAcceptLanguage(acceptLanguageHeader);
            for (const code of candidates) {
                const lang = await this.languageRepo.findByCode(code);
                if (lang?.isActive)
                    return lang.code;
            }
        }
        // Try user's profile language
        if (userPreferredLang) {
            const lang = await this.languageRepo.findByCode(userPreferredLang);
            if (lang?.isActive)
                return lang.code;
        }
        // Fall back to platform default
        const platformDefault = await this.languageRepo.findDefault();
        return platformDefault?.code ?? defaultLang;
    }
    parseAcceptLanguage(header) {
        // Parse 'hi-IN,hi;q=0.9,en;q=0.8' → ['hi', 'en']
        return header
            .split(",")
            .map((part) => {
            const [lang] = part.trim().split(";");
            // Normalize: hi-IN → hi
            return lang.trim().split("-")[0].toLowerCase();
        })
            .filter(Boolean);
    }
}
