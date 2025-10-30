import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDate,
  IsEmail,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  // Informações cadastrais básicas
  @IsString({ message: 'Razão social deve ser uma string' })
  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @Length(3, 200, { message: 'Razão social deve ter entre 3 e 200 caracteres' })
  razaoSocial: string;

  @IsOptional()
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  @Length(3, 200, { message: 'Nome fantasia deve ter entre 3 e 200 caracteres' })
  nomeFantasia?: string;

  @IsString({ message: 'CNPJ deve ser uma string' })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @Length(14, 14, { message: 'CNPJ deve ter 14 caracteres' })
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas números' })
  cnpj: string;

  @IsOptional()
  @IsString({ message: 'Inscrição estadual deve ser uma string' })
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString({ message: 'Inscrição municipal deve ser uma string' })
  inscricaoMunicipal?: string;

  // Regime tributário e atividades
  @IsOptional()
  @IsString({ message: 'Regime tributário deve ser uma string' })
  regimeTributario?: string;

  @IsOptional()
  @IsString({ message: 'CNAE principal deve ser uma string' })
  cnaePrincipal?: string;

  @IsOptional()
  @IsArray({ message: 'CNAEs secundários deve ser um array' })
  @IsString({ each: true, message: 'Cada CNAE secundário deve ser uma string' })
  cnaeSecundarios?: string[];

  // Datas e situação
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de abertura deve ser uma data válida' })
  dataAbertura?: Date;

  @IsOptional()
  @IsString({ message: 'Situação cadastral deve ser uma string' })
  situacaoCadastral?: string;

  // Endereço
  @IsOptional()
  @IsString({ message: 'Logradouro deve ser uma string' })
  logradouro?: string;

  @IsOptional()
  @IsString({ message: 'Número deve ser uma string' })
  numero?: string;

  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  complemento?: string;

  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  bairro?: string;

  @IsOptional()
  @IsString({ message: 'Cidade deve ser uma string' })
  cidade?: string;

  @IsOptional()
  @IsString({ message: 'Estado deve ser uma string' })
  @Length(2, 2, { message: 'Estado deve ter 2 caracteres (UF)' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  @Matches(/^\d{8}$/, { message: 'CEP deve conter 8 dígitos' })
  cep?: string;

  @IsOptional()
  @IsString({ message: 'País deve ser uma string' })
  pais?: string;

  // Contatos
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  telefone?: string;

  @IsOptional()
  @IsString({ message: 'Celular deve ser uma string' })
  celular?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser válido' })
  email?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Site deve ser uma URL válida' })
  site?: string;

  // Configurações fiscais e tributárias
  @IsOptional()
  @IsString({ message: 'Tipo de contribuinte deve ser uma string' })
  tipoContribuinte?: string;

  @IsOptional()
  @IsString({ message: 'Regime de apuração deve ser uma string' })
  regimeApuracao?: string;

  @IsOptional()
  @IsString({ message: 'Código do município IBGE deve ser uma string' })
  @Length(7, 7, { message: 'Código IBGE do município deve ter 7 dígitos' })
  @Matches(/^\d{7}$/, { message: 'Código IBGE deve conter apenas números' })
  codigoMunicipioIBGE?: string;

  @IsOptional()
  @IsString({ message: 'Código do estado IBGE deve ser uma string' })
  @Length(2, 2, { message: 'Código IBGE do estado deve ter 2 dígitos' })
  @Matches(/^\d{2}$/, { message: 'Código IBGE deve conter apenas números' })
  codigoEstadoIBGE?: string;

  @IsOptional()
  @IsString({ message: 'CFOP padrão deve ser uma string' })
  @Matches(/^\d{4}$/, { message: 'CFOP deve ter 4 dígitos' })
  cfopPadrao?: string;

  // Certificado digital
  @IsOptional()
  @IsString({ message: 'Caminho do certificado digital deve ser uma string' })
  certificadoDigitalPath?: string;

  @IsOptional()
  @IsString({ message: 'Senha do certificado deve ser uma string' })
  certificadoDigitalSenha?: string;

  // Numeração de notas fiscais
  @IsOptional()
  @IsString({ message: 'Série NF-e deve ser uma string' })
  serieNFe?: string;

  @IsOptional()
  @IsString({ message: 'Série NFC-e deve ser uma string' })
  serieNFCe?: string;

  @IsOptional()
  @IsString({ message: 'Série NFS-e deve ser uma string' })
  serieNFSe?: string;

  @IsOptional()
  @IsString({ message: 'Ambiente fiscal deve ser uma string' })
  ambienteFiscal?: string;

  // Controle interno
  @IsOptional()
  @IsBoolean({ message: 'Active deve ser um booleano' })
  active?: boolean;
}
