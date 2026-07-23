export class FileSignDto {
    fileName;
    mimeType;
    fileSize;
    checksum;
    constructor(input) {
        this.fileName = input.fileName;
        this.mimeType = input.mimeType;
        this.fileSize = input.fileSize;
        this.checksum = input.checksum;
    }
}
