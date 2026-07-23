export class FileSignDto {
  public readonly fileName: string;
  public readonly mimeType: string;
  public readonly fileSize: number;
  public readonly checksum?: string;

  constructor(input: FileSignDto) {
    this.fileName = input.fileName;
    this.mimeType = input.mimeType;
    this.fileSize = input.fileSize;
    this.checksum = input.checksum;
  }
}
