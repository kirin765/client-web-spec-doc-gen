import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum SiteTypeEnum {
  LANDING = 'landing',
  ECOMMERCE = 'ecommerce',
  CORPORATE = 'corporate',
  PORTAL = 'portal',
}

export class CreateDraftDto {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsNotEmpty()
  @IsEnum(SiteTypeEnum)
  siteType: SiteTypeEnum;

  @IsOptional()
  @IsString()
  description?: string;
}
