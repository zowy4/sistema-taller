import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LoggerService } from './common/logger/logger.service';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    
    // Use custom logger
    const logger = app.get(LoggerService);
    app.useLogger(logger);
    
    logger.log('Creating NestJS application...', 'Bootstrap');
    
    // 1. Seguridad: Sanitización de cabeceras HTTP
    app.use(helmet());
    
    // 2. Validación y Sanitización estricta de Payloads
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Elimina campos que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían campos no autorizados
      transform: true, // Transforma automáticamente strings a números/fechas
    }));
    
    // 3. Mapeo de salidas: Excluir datos sensibles (@Exclude)
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    
    // 4. Manejo global de excepciones
    app.useGlobalFilters(new AllExceptionsFilter());
    
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
