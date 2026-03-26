import { IsString } from 'class-validator';

export class CreateQuoteShareDto {
  @IsString()
  projectRequestId: string;

  @IsString()
  developerId: string;
}
