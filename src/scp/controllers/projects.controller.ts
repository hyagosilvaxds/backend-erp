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
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ListProjectsDto } from '../dto/list-projects.dto';

@Controller('scp/projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() createDto: CreateProjectDto) {
    return this.projectsService.create(companyId, createDto);
  }

  @Get()
  findAll(@CompanyId() companyId: string, @Query() filters: ListProjectsDto) {
    return this.projectsService.findAll(companyId, filters);
  }

  @Get('stats')
  getStats(@CompanyId() companyId: string) {
    return this.projectsService.getStats(companyId);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.projectsService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(companyId, id, updateDto);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.projectsService.remove(companyId, id);
  }
}
