import { IsObject, IsNotEmpty } from 'class-validator';

export class SubmitProjectRequestDto {
  @IsNotEmpty()
  @IsObject()
  rawAnswers: Record<string, any>;
}
