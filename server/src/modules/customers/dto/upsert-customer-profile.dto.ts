import { IsOptional, IsString } from 'class-validator';

export class UpsertCustomerProfileDto {
  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  introduction?: string;

  @IsOptional()
  @IsString()
  regionCode?: string;
}
