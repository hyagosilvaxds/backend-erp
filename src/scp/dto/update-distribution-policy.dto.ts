import { PartialType } from '@nestjs/mapped-types';
import { CreateDistributionPolicyDto } from './create-distribution-policy.dto';

export class UpdateDistributionPolicyDto extends PartialType(CreateDistributionPolicyDto) {}
