import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  controllers: [ClientsController],
  providers: [ClientsService, PrismaService],
  exports: [ClientsService], 
})
export class ClientsModule {}
