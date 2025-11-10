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
import { InvestmentsService } from '../services/investments.service';
import { CreateInvestmentDto } from '../dto/create-investment.dto';
import { UpdateInvestmentDto } from '../dto/update-investment.dto';
import { ListInvestmentsDto } from '../dto/list-investments.dto';

@Controller('scp/investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() createDto: CreateInvestmentDto) {
    return this.investmentsService.create(companyId, createDto);
  }

  @Get()
  findAll(@CompanyId() companyId: string, @Query() filters: ListInvestmentsDto) {
    return this.investmentsService.findAll(companyId, filters);
  }

  @Get('by-investor/:investorId')
  getInvestorInvestments(@CompanyId() companyId: string, @Param('investorId') investorId: string) {
    return this.investmentsService.getInvestorInvestments(companyId, investorId);
  }

  @Get('by-project/:projectId')
  getProjectInvestments(@CompanyId() companyId: string, @Param('projectId') projectId: string) {
    return this.investmentsService.getProjectInvestments(companyId, projectId);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.investmentsService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateInvestmentDto,
  ) {
    return this.investmentsService.update(companyId, id, updateDto);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.investmentsService.remove(companyId, id);
  }
}
