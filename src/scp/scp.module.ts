import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';

// Services
import { InvestorsService } from './services/investors.service';
import { ProjectsService } from './services/projects.service';
import { InvestmentsService } from './services/investments.service';
import { DistributionPoliciesService } from './services/distribution-policies.service';
import { DistributionsService } from './services/distributions.service';
import { ProjectDocumentsService } from './services/project-documents.service';
import { InvestmentDocumentsService } from './services/investment-documents.service';

// Controllers
import { InvestorsController } from './controllers/investors.controller';
import { ProjectsController } from './controllers/projects.controller';
import { InvestmentsController } from './controllers/investments.controller';
import { DistributionPoliciesController } from './controllers/distribution-policies.controller';
import { DistributionsController } from './controllers/distributions.controller';
import { ProjectDocumentsController } from './controllers/project-documents.controller';
import { InvestmentDocumentsController } from './controllers/investment-documents.controller';

@Module({
  imports: [PrismaModule, DocumentsModule],
  controllers: [
    InvestorsController,
    ProjectsController,
    InvestmentsController,
    DistributionPoliciesController,
    DistributionsController,
    ProjectDocumentsController,
    InvestmentDocumentsController,
  ],
  providers: [
    InvestorsService,
    ProjectsService,
    InvestmentsService,
    DistributionPoliciesService,
    DistributionsService,
    ProjectDocumentsService,
    InvestmentDocumentsService,
  ],
  exports: [
    InvestorsService,
    ProjectsService,
    InvestmentsService,
    DistributionPoliciesService,
    DistributionsService,
    ProjectDocumentsService,
    InvestmentDocumentsService,
  ],
})
export class ScpModule {}
