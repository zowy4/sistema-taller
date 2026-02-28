import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const objResponse: any = exceptionResponse;
        message = objResponse.message || message;
      }
    }

    // Log del error real en consola (para debugging)
    console.error(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
      exception instanceof Error ? exception.message : exception,
    );

    // Respuesta sanitizada al cliente (sin exponer detalles internos)
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Error interno del servidor. Por favor, intente más tarde.'
          : message,
    });
  }
}
