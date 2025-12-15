import { Module } from '@nestjs/common';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [ProveedoresController],
  providers: [ProveedoresService, PrismaService],
  exports: [ProveedoresService],
})
export class ProveedoresModule {}
