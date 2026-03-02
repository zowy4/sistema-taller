import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthorizationService } from './authorization.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientsModule } from '../clients/clients.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { jwtConstants } from './jwt.constants';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    ClientsModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, AuthorizationService, JwtStrategy], // GoogleStrategy, GitHubStrategy commented - require env vars
  controllers: [AuthController],
  exports: [AuthService, AuthorizationService, PassportModule, JwtModule],
})
export class AuthModule {}
