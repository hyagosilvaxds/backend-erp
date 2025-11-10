import { PartialType } from '@nestjs/mapped-types';
import { CreateLegalCategoryDto } from './create-legal-category.dto';

export class UpdateLegalCategoryDto extends PartialType(CreateLegalCategoryDto) {}
