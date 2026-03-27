import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertExpertPortfolioDto {
  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
