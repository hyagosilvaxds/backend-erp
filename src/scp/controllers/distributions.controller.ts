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
import { DistributionsService } from '../services/distributions.service';
import { CreateDistributionDto } from '../dto/create-distribution.dto';
import { UpdateDistributionDto } from '../dto/update-distribution.dto';
import { ListDistributionsDto } from '../dto/list-distributions.dto';
import { CreateBulkDistributionDto } from '../dto/create-bulk-distribution.dto';
import { BulkCreateFromPoliciesDto } from '../dto/bulk-create-from-policies.dto';

@Controller('scp/distributions')
@UseGuards(JwtAuthGuard)
export class DistributionsController {
  constructor(private readonly distributionsService: DistributionsService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() createDto: CreateDistributionDto) {
    return this.distributionsService.create(companyId, createDto);
  }

  @Post('bulk')
  createBulk(@CompanyId() companyId: string, @Body() createDto: CreateBulkDistributionDto) {
    return this.distributionsService.createBulk(companyId, createDto);
  }

  @Get()
  findAll(@CompanyId() companyId: string, @Query() filters: ListDistributionsDto) {
    return this.distributionsService.findAll(companyId, filters);
  }

  @Get('by-investor/:investorId')
  getInvestorDistributions(@CompanyId() companyId: string, @Param('investorId') investorId: string) {
    return this.distributionsService.getInvestorDistributions(companyId, investorId);
  }

  @Get('by-project/:projectId')
  getProjectDistributions(@CompanyId() companyId: string, @Param('projectId') projectId: string) {
    return this.distributionsService.getProjectDistributions(companyId, projectId);
  }

  @Post('bulk-create')
  bulkCreateFromPolicies(
    @CompanyId() companyId: string,
    @Body() dto: BulkCreateFromPoliciesDto,
  ) {
    return this.distributionsService.bulkCreateFromPolicies(
      companyId,
      dto.projectId,
      dto.baseValue,
      dto.competenceDate,
      dto.distributionDate,
      dto.irrf,
      dto.otherDeductions,
    );
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.distributionsService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateDistributionDto,
  ) {
    return this.distributionsService.update(companyId, id, updateDto);
  }

  @Post(':id/mark-as-paid')
  markAsPaid(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.distributionsService.markAsPaid(companyId, id);
  }

  @Post(':id/mark-as-canceled')
  markAsCanceled(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.distributionsService.markAsCanceled(companyId, id);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.distributionsService.remove(companyId, id);
  }
}
