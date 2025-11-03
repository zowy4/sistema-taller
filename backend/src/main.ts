import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    console.log('Creating NestJS application...');
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
      origin: 'http://localhost:3000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

  const port = parseInt(process.env.PORT || '3002', 10);
  console.log(`Starting to listen on port ${port}...`);
  await app.listen(port);
  console.log(`✅ Backend is running on: http://localhost:${port}`);
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
