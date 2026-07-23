import { FileSignDto } from "../dto/file-sign.dto";
import { FileStorageService } from "../services/file-storage.service";
import {
  FileStorageContract,
  SignedUploadRequest,
  SignedUploadResponse,
} from "./file-storage.contract";

export class FileStorageContractAdapter implements FileStorageContract {
  public readonly moduleName = "file-storage";
  public readonly version = "1.0.0";

  constructor(private readonly service: FileStorageService) {}

  public async createSignedUpload(
    input: SignedUploadRequest,
  ): Promise<SignedUploadResponse> {
    const target = await this.service.createUploadTarget(
      input.companyId,
      "system",
      new FileSignDto({
        fileName: input.fileName,
        mimeType: input.contentType,
        fileSize: input.sizeBytes,
      }),
    );

    return {
      storageKey: target.storageKey,
      uploadUrl: target.uploadUrl,
      expiresAt: new Date(target.expiresAt),
    };
  }
}
