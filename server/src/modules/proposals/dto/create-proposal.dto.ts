import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProposalDto {
  @IsString()
  projectRequestId: string;

  @IsString()
  developerId: string;

  @IsInt()
  @Min(0)
  priceMin: number;

  @IsInt()
  @Min(0)
  priceMax: number;

  @IsString()
  estimatedDurationText: string;

  @IsString()
  message: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  portfolioLinks?: string[];
}
