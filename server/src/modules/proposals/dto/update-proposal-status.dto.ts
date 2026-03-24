import { IsIn } from 'class-validator';

export class UpdateProposalStatusDto {
  @IsIn(['accepted', 'rejected'])
  status: 'accepted' | 'rejected';
}
