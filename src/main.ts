import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Servir arquivos estáticos - usa caminho absoluto que nunca se perde
  // Em desenvolvimento: /caminho/do/projeto/uploads
  // Em produção: variável de ambiente UPLOADS_PATH ou caminho absoluto
  const uploadsPath = process.env.UPLOADS_PATH || join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });
  
  console.log(`📁 Servindo arquivos estáticos de: ${uploadsPath}`);
  
  // Ativar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilitar CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',           // Development local
                // Vite dev server
      'https://erp.otimizeagenda.com',   // Produção
      'http://erp.otimizeagenda.com',    // Produção HTTP
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-company-id',
      'Accept',
    ],
    credentials: true,
    maxAge: 3600, // Cache preflight por 1 hora
  });

  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 Aplicação rodando em: http://localhost:${process.env.PORT ?? 4000}`);
  console.log(`🌐 CORS habilitado para: erp.otimizeagenda.com`);
}
bootstrap();
