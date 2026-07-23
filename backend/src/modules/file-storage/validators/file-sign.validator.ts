import { z } from "zod";
import { FileSignDto } from "../dto/file-sign.dto";

export class FileSignValidator {
  private readonly schema = z.object({
    fileName: z.string().min(1).max(255).regex(/^[a-zA-Z0-9._ -]+$/),
    mimeType: z.string().min(3).max(120),
    fileSize: z.number().int().positive().max(200 * 1024 * 1024),
    checksum: z.string().min(16).max(256).optional(),
  });

  public parse(input: unknown): FileSignDto {
    return new FileSignDto(this.schema.parse(input));
  }
}
