import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. Importa ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Habilita el Validador Global
  app.useGlobalPipes(new ValidationPipe());

  // 3. Habilita CORS (¡CRÍTICO!)
  // Esto permite que tu frontend en localhost:3000 llame a esta API
  app.enableCors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3002);
  console.log(`Backend is running on: http://localhost:3002`);
}
bootstrap();
