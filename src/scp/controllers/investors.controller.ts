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
import { InvestorsService } from '../services/investors.service';
import { CreateInvestorDto } from '../dto/create-investor.dto';
import { UpdateInvestorDto } from '../dto/update-investor.dto';
import { ListInvestorsDto } from '../dto/list-investors.dto';

@Controller('scp/investors')
@UseGuards(JwtAuthGuard)
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() createDto: CreateInvestorDto) {
    return this.investorsService.create(companyId, createDto);
  }

  @Get()
  findAll(@CompanyId() companyId: string, @Query() filters: ListInvestorsDto) {
    return this.investorsService.findAll(companyId, filters);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.investorsService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateInvestorDto,
  ) {
    return this.investorsService.update(companyId, id, updateDto);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.investorsService.remove(companyId, id);
  }
}
