import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SnakeCaseInterceptor } from './common/interceptors/snake-case.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();
  
  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Serialización snake_case en todas las respuestas
  app.useGlobalInterceptors(new SnakeCaseInterceptor());

  // Prefijo global de API
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  
  await app.listen(port);
  console.log(`Backend de Dulsere ejecutándose en: http://localhost:${port}/api`);
}
bootstrap();
