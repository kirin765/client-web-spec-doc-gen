// S3 저장소 서비스: 서명 URL 기본 만료 시간을 1시간으로 단축
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private readonly defaultExpiresIn: number;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('aws.region') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    const bucket = this.configService.get<string>('aws.s3Bucket');

    this.bucket = bucket || 'spec-gen-documents';
    // 기본값: 1시간 (3600초), 환경 변수로 설정 가능
    this.defaultExpiresIn =
      this.configService.get<number>('aws.signedUrlExpiration') || 3600;

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      this.s3Client = new S3Client({ region });
    }
  }

  async uploadFile(
    key: string,
    body: Buffer | string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    return `s3://${this.bucket}/${key}`;
  }

  async getSignedUrl(
    key: string,
    expiresIn?: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresIn ?? this.defaultExpiresIn,
    });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}

