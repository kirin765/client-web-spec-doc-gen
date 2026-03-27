import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StorageService } from '../../common/storage/storage.service';

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@Injectable()
export class UploadsService {
  constructor(private storageService: StorageService) {}

  async uploadImages(userId: string, files: UploadedImageFile[]) {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const key = `portfolio-images/${userId}/${Date.now()}-${randomUUID()}-${sanitizeFilename(file.originalname)}`;
        const storageUrl = await this.storageService.uploadFile(
          key,
          file.buffer,
          file.mimetype || 'application/octet-stream',
        );

        return {
          storageUrl,
          url: await this.storageService.getSignedUrl(key),
          contentType: file.mimetype || 'application/octet-stream',
          originalName: file.originalname,
        };
      }),
    );

    return { files: uploaded };
  }
}
