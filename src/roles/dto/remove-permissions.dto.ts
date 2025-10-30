import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class RemovePermissionsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Deve fornecer pelo menos uma permissão' })
  @IsUUID('4', { each: true, message: 'IDs de permissões devem ser UUIDs válidos' })
  permissionIds: string[];
}
