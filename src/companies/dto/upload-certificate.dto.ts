import { IsNotEmpty, IsString } from 'class-validator';

export class UploadCertificateDto {
  @IsNotEmpty({ message: 'A senha do certificado é obrigatória' })
  @IsString()
  senha: string;
}
