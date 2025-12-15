import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('TallerApp', {
        colors: true,
        prettyPrint: true,
      }),
    );

    // Transport configuration
    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: isProduction ? logFormat : consoleFormat,
        level: isProduction ? 'info' : 'debug',
      }),
    ];

    // Add file transports in production
    if (isProduction) {
      // Error logs - separate file
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: logFormat,
          maxFiles: '30d',
          maxSize: '20m',
          zippedArchive: true,
        }),
      );

      // Combined logs - all levels
      transports.push(
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          format: logFormat,
          maxFiles: '14d',
          maxSize: '20m',
          zippedArchive: true,
        }),
      );

      // Access logs - HTTP requests
      transports.push(
        new DailyRotateFile({
          filename: 'logs/access-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'http',
          format: logFormat,
          maxFiles: '7d',
          maxSize: '20m',
          zippedArchive: true,
        }),
      );
    }

    this.logger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: logFormat,
      transports,
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom methods for specific use cases
  http(message: string, meta?: any) {
    this.logger.log('http', message, meta);
  }

  logRequest(req: any, res: any, responseTime: number) {
    const { method, originalUrl, ip, headers } = req;
    const { statusCode } = res;
    const userAgent = headers['user-agent'] || 'Unknown';

    this.http('HTTP Request', {
      method,
      url: originalUrl,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent,
    });
  }

  logError(error: Error, context?: string) {
    this.error(
      `${error.message}`,
      error.stack,
      context || error.constructor.name,
    );
  }

  logDatabaseQuery(query: string, duration: number) {
    this.debug(`Database Query: ${query}`, `Database (${duration}ms)`);
  }

  logAuthentication(userId: number, action: string, success: boolean) {
    const level = success ? 'info' : 'warn';
    this.logger.log(level, `Authentication: ${action}`, {
      userId,
      success,
      context: 'Authentication',
    });
  }
}
