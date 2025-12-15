import { Module } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [OrdenesController],
  providers: [OrdenesService, PrismaService],
  exports: [OrdenesService],
})
export class OrdenesModule {}
