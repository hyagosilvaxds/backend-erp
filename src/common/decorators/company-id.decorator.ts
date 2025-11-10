import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

/**
 * Decorator para extrair o companyId do header x-company-id
 * 
 * @example
 * ```typescript
 * @Post()
 * create(@CompanyId() companyId: string, @Body() dto: CreateDto) {
 *   return this.service.create(companyId, dto);
 * }
 * ```
 */
export const CompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const companyId = request.headers['x-company-id'] as string;

    if (!companyId) {
      throw new BadRequestException(
        'Header x-company-id é obrigatório. Especifique a empresa para esta operação.',
      );
    }

    return companyId;
  },
);
