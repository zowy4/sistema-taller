import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Log when response finishes
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      this.logger.logRequest(req, res, responseTime);
    });

    next();
  }
}
