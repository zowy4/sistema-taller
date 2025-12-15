import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { RepuestosModule } from './repuestos/repuestos.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ServiciosModule } from './servicios/servicios.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { FacturasModule } from './facturas/facturas.module';
import { StatsModule } from './stats/stats.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ComprasModule } from './compras/compras.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PortalModule } from './portal/portal.module';
import { LoggerModule } from './common/logger/logger.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './common/logger/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    LoggerModule,
    PrismaModule,
    ClientsModule,
    AuthModule,
    RepuestosModule,
    VehiculosModule,
    ServiciosModule,
    OrdenesModule,
    EmpleadosModule,
    FacturasModule,
    StatsModule,
    ProveedoresModule,
    ComprasModule,
    DashboardModule,
    PortalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
