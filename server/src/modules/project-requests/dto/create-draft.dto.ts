import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum SiteTypeEnum {
  LANDING = 'landing',
  BROCHURE = 'brochure',
  ECOMMERCE = 'ecommerce',
  WEBAPP = 'webapp',
  BLOG = 'blog',
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
