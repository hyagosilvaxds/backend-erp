import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const SKIP_PERMISSIONS_KEY = 'skipPermissions';
export const SkipPermissions = () => SetMetadata(SKIP_PERMISSIONS_KEY, true);
