import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  quoteShareId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  content: string;
}
