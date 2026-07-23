import { createHmac, randomUUID } from "crypto";
import { env } from "../../../infrastructure/config/env";
import { logger } from "../../../infrastructure/logger";
import { FileSignDto } from "../dto/file-sign.dto";

export class FileStorageService {
  public async createUploadTarget(
    companyId: string,
    userId: string,
    dto: FileSignDto,
  ): Promise<{ storageKey: string; uploadUrl: string; expiresAt: string; headers: Record<string, string> }> {
    const safeName = dto.fileName.trim().replace(/\s+/g, "-");
    const storageKey = `${companyId}/${randomUUID()}-${safeName}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const signature = this.sign(`${storageKey}:${dto.fileSize}:${dto.mimeType}:${expiresAt}`);

    await logger.info("File upload target generated", {
      module: "file-storage.service",
      companyId,
      userId,
      tags: ["file-storage", "sign", "created"],
      payload: { storageKey, mimeType: dto.mimeType, fileSize: dto.fileSize },
    });

    return {
      storageKey,
      uploadUrl: `/file-storage/upload/${encodeURIComponent(storageKey)}?expires=${encodeURIComponent(expiresAt)}&signature=${signature}`,
      expiresAt,
      headers: {
        "content-type": dto.mimeType,
        "x-file-size": dto.fileSize.toString(),
        ...(dto.checksum ? { "x-file-checksum": dto.checksum } : {}),
      },
    };
  }

  public buildPublicUrl(storageKey: string): string {
    return `/files/${encodeURIComponent(storageKey)}`;
  }

  private sign(payload: string): string {
    return createHmac("sha256", env.jwtAccessSecretKey).update(payload).digest("hex");
  }
}
