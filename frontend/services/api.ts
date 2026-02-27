import { UploadResponse, UploadError } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Upload a file to the backend API with progress tracking
 * @param file - File to upload
 * @param onProgress - Callback function to track upload progress (0-100)
 * @returns Promise with upload response
 */
const uploadFile = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      reject(
        new UploadError(
          `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          400,
          'FILE_TOO_LARGE'
        )
      );
      return;
    }

    // Validate file exists
    if (!file || file.size === 0) {
      reject(
        new UploadError('Invalid file or empty file', 400, 'INVALID_FILE')
      );
      return;
    }

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(
            new UploadError(
              'Invalid response from server',
              xhr.status,
              'INVALID_RESPONSE'
            )
          );
        }
      } else {
        // Handle HTTP errors
        let errorMessage = 'Upload failed';
        let errorCode = 'UPLOAD_FAILED';

        try {
          const errorData = JSON.parse(xhr.responseText);
          errorMessage = errorData.message || errorMessage;
          errorCode = errorData.code || errorCode;
        } catch {
          // Use default error message if response is not JSON
          if (xhr.status === 413) {
            errorMessage = 'File is too large';
            errorCode = 'FILE_TOO_LARGE';
          } else if (xhr.status === 415) {
            errorMessage = 'File type not supported';
            errorCode = 'UNSUPPORTED_FILE_TYPE';
          } else if (xhr.status >= 500) {
            errorMessage = 'Server error. Please try again later';
            errorCode = 'SERVER_ERROR';
          }
        }

        reject(new UploadError(errorMessage, xhr.status, errorCode));
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(
        new UploadError(
          'Network error. Please check your connection',
          0,
          'NETWORK_ERROR'
        )
      );
    });

    // Handle request timeout
    xhr.addEventListener('timeout', () => {
      reject(
        new UploadError(
          'Upload timeout. Please try again',
          0,
          'TIMEOUT'
        )
      );
    });

    // Handle request abort
    xhr.addEventListener('abort', () => {
      reject(
        new UploadError(
          'Upload cancelled',
          0,
          'CANCELLED'
        )
      );
    });

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    // Configure and send request
    xhr.open('POST', `${API_URL}/api/upload`);
    xhr.timeout = 300000; // 5 minutes timeout
    xhr.send(formData);
  });
};

export const api = {
  upload: uploadFile,
};
