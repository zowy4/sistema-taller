import { Module } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OrdenesController],
  providers: [OrdenesService, PrismaService],
})
export class OrdenesModule {}
