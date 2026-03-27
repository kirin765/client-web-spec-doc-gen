import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertExpertFaqDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
