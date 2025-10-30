import { PartialType } from '@nestjs/mapped-types';
import { CreateProductBrandDto } from './create-product-brand.dto';

export class UpdateProductBrandDto extends PartialType(CreateProductBrandDto) {}
