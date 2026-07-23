import { LoggerConstants } from "../logger.constants";
export class MetadataUtils {
    static normalize(metadata) {
        if (!metadata) {
            return {
                tags: LoggerConstants.DEFAULT_TAGS,
            };
        }
        return {
            ...metadata,
            tags: metadata.tags ?? LoggerConstants.DEFAULT_TAGS,
        };
    }
}
