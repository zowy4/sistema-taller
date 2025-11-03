import { Module } from '@nestjs/common';
import { RepuestosService } from './repuestos.service';
import { RepuestosController } from './repuestos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RepuestosController],
  providers: [RepuestosService],
  exports: [RepuestosService],
})
export class RepuestosModule {}
