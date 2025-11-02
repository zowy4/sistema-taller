import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. Importa ValidationPipe

async function bootstrap() {
  try {
    console.log('Creating NestJS application...');
    const app = await NestFactory.create(AppModule);

    // 2. Habilita el Validador Global
    app.useGlobalPipes(new ValidationPipe());

    // 3. Habilita CORS (¡CRÍTICO!)
    // Permite que el frontend en localhost:3000 (Next.js) haga peticiones
    app.enableCors({
      origin: 'http://localhost:3000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Listen on port 3002
    console.log('Starting to listen on port 3002...');
    await app.listen(3002);
    console.log(`✅ Backend is running on: http://localhost:3002`);
    console.log(`Server is ready to accept connections`);
  } catch (error) {
    console.error('❌ Error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Unhandled error in bootstrap:', err);
  process.exit(1);
});
