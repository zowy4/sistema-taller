import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    
    // Use custom logger
    const logger = app.get(LoggerService);
    app.useLogger(logger);
    
    logger.log('Creating NestJS application...', 'Bootstrap');
    
    app.useGlobalPipes(new ValidationPipe());
    
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://78.12.192.211:3000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    const port = parseInt(process.env.PORT || '3002', 10);
    logger.log(`Starting to listen on port ${port}...`, 'Bootstrap');
    await app.listen(port);
    logger.log(`✅ Backend is running on: http://localhost:${port}`, 'Bootstrap');
    logger.log(`Server is ready to accept connections`, 'Bootstrap');
  } catch (error) {
    console.error('❌ Error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Unhandled error in bootstrap:', err);
  process.exit(1);
});
