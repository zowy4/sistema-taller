import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en toda la app
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

