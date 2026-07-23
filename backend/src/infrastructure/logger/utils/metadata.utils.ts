import { LoggerConstants } from "../logger.constants";
import { LogMetadata } from "../logger.types";

export class MetadataUtils {
  public static normalize(metadata?: LogMetadata): LogMetadata {
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
