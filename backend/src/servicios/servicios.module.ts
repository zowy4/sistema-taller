import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  controllers: [ServiciosController],
  providers: [ServiciosService, PrismaService],
})
export class ServiciosModule {}
