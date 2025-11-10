import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extrair o userId do token JWT
 * 
 * @example
 * ```typescript
 * @Post()
 * create(@UserId() userId: string, @Body() dto: CreateDto) {
 *   return this.service.create(userId, dto);
 * }
 * ```
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
  },
);
