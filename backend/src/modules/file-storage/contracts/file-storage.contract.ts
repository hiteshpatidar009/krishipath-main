import { ModuleContract } from "../../../core";

export interface SignedUploadRequest {
  readonly companyId: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
}

export interface SignedUploadResponse {
  readonly storageKey: string;
  readonly uploadUrl: string;
  readonly expiresAt: Date;
}

export interface FileStorageContract extends ModuleContract {
  createSignedUpload(input: SignedUploadRequest): Promise<SignedUploadResponse>;
}
