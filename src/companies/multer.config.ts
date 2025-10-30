import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

// Configuração para upload de logos
export const logoStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/logos';
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const filename = `logo-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// Configuração para upload de certificados
export const certificateStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/certificates';
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `cert-${uniqueSuffix}.pfx`;
    cb(null, filename);
  },
});

// Filtro para aceitar apenas imagens
export const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(
      new BadRequestException(
        'Apenas arquivos de imagem são permitidos (jpg, jpeg, png, gif, webp)',
      ),
      false,
    );
  }
  cb(null, true);
};

// Filtro para aceitar apenas certificados .pfx
export const certificateFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(pfx|p12)$/i)) {
    return cb(
      new BadRequestException(
        'Apenas arquivos de certificado digital são permitidos (.pfx ou .p12)',
      ),
      false,
    );
  }
  cb(null, true);
};

// Limite de tamanho para logos: 5MB
export const logoMaxSize = 5 * 1024 * 1024;

// Limite de tamanho para certificados: 10MB
export const certificateMaxSize = 10 * 1024 * 1024;
