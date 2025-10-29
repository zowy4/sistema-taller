import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'; // 1. Importa PrismaModule
import { ClientsModule } from './clients/clients.module'; // 2. (Ya debería estar aquí)

@Module({
  imports: [
    PrismaModule, // 3. Añade PrismaModule aquí
    ClientsModule, // 4. (Ya debería estar aquí)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

