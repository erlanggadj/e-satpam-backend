import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Global prefix versi API
  app.setGlobalPrefix('api/v1');

  // 2. Auto-validasi semua DTO secara global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.error('ValidationPipe Errors:', JSON.stringify(errors, null, 2));
        return new (require('@nestjs/common').BadRequestException)(errors);
      }
    }),
  );

  // 3. Auto-wrap semua response ke format standar
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 4. Auto-handle semua error ke format standar
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('E-Satpam API')
    .setDescription('API Backend untuk aplikasi E-Satpam Mobile')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 6. CORS untuk Mobile
  app.enableCors({ origin: '*' });

  const port = process.env.PORT ?? 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 E - Satpam Backend running on http://0.0.0.0:${port}/api/v1`);
}
bootstrap();
