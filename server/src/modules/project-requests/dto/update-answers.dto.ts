import { IsObject, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateAnswersDto {
  @IsNotEmpty()
  @IsObject()
  rawAnswers: Record<string, any>;

  @IsOptional()
  @IsObject()
  normalizedSpec?: Record<string, any>;
}
