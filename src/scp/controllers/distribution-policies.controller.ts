import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { DistributionPoliciesService } from '../services/distribution-policies.service';
import { CreateDistributionPolicyDto } from '../dto/create-distribution-policy.dto';
import { UpdateDistributionPolicyDto } from '../dto/update-distribution-policy.dto';
import { ListDistributionPoliciesDto } from '../dto/list-distribution-policies.dto';

@Controller('scp/distribution-policies')
@UseGuards(JwtAuthGuard)
export class DistributionPoliciesController {
  constructor(private readonly policiesService: DistributionPoliciesService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() createDto: CreateDistributionPolicyDto) {
    return this.policiesService.create(companyId, createDto);
  }

  @Get()
  findAll(@CompanyId() companyId: string, @Query() filters: ListDistributionPoliciesDto) {
    return this.policiesService.findAll(companyId, filters);
  }

  @Get('by-project/:projectId')
  getProjectPolicies(@CompanyId() companyId: string, @Param('projectId') projectId: string) {
    return this.policiesService.getProjectPolicies(companyId, projectId);
  }

  @Post('calculate-amounts/:projectId')
  calculateDistributionAmounts(
    @CompanyId() companyId: string,
    @Param('projectId') projectId: string,
    @Body() body: { baseValue: number },
  ) {
    return this.policiesService.calculateDistributionAmounts(
      companyId,
      projectId,
      body.baseValue,
    );
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.policiesService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateDistributionPolicyDto,
  ) {
    return this.policiesService.update(companyId, id, updateDto);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.policiesService.remove(companyId, id);
  }
}
