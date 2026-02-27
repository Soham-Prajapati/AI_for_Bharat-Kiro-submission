export interface UploadResponse {
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  s3Url: string;
  uploadedAt: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export class UploadError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'UploadError';
  }
}
