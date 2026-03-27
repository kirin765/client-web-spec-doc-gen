import { IsString, IsIn, IsArray, IsNumber, IsOptional, Min, IsUrl } from 'class-validator';
import type { AvailabilityStatus, DeveloperType } from '../../../types/developer';

export class CreateDeveloperDto {
  @IsString()
  displayName: string;

  @IsIn(['freelancer', 'agency'])
  type: DeveloperType;

  @IsString()
  headline: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  @IsArray()
  @IsString({ each: true })
  supportedProjectTypes: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportedCoreFeatures?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportedEcommerceFeatures?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportedDesignStyles?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportedDesignComplexities?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportedTimelines?: string[];

  @IsNumber()
  @Min(0)
  budgetMin: number;

  @IsNumber()
  @Min(0)
  budgetMax: number;

  @IsIn(['available', 'busy', 'limited'])
  @IsOptional()
  availabilityStatus?: AvailabilityStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  avgResponseHours?: number;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  portfolioLinks?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  regions?: string[];

  @IsString()
  @IsOptional()
  regionCode?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsString()
  @IsOptional()
  introduction?: string;
}
