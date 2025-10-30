import { diskStorage } from 'multer';
import { Request } from 'express';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync, existsSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

// Tipos MIME permitidos
const ALLOWED_MIMETYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
];

// Tamanho máximo: 50 MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const multerConfig = {
  storage: diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const companyId = req.headers['x-company-id'] as string;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      const path = `./uploads/documents/${companyId}/${year}/${month}`;

      // Criar diretório se não existir
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }

      cb(null, path);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const uuid = randomUUID();
      const ext = extname(file.originalname);
      cb(null, `${uuid}${ext}`);
    },
  }),

  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Tipo de arquivo não permitido: ${file.mimetype}. Aceitos: PDF, imagens, Word, Excel, PowerPoint, texto, ZIP`,
        ),
        false,
      );
    }
    cb(null, true);
  },
};
