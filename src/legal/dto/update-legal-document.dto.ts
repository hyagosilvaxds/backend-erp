import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateLegalDocumentDto } from './create-legal-document.dto';

// Remove campos relacionados ao upload, pois não devem ser atualizáveis
export class UpdateLegalDocumentDto extends PartialType(
  OmitType(CreateLegalDocumentDto, ['folderId', 'documentName', 'documentDescription'] as const),
) {}
