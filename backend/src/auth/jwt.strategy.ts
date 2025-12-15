import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'CHANGE_ME_REPLACE_WITH_ENV_SECRET',
    });
  }
  async validate(payload: any) {
    const userId = payload.sub ?? payload.id;
    if (!userId) throw new UnauthorizedException();
    return {
      id: userId,
      email: payload.email,
      rol: payload.rol,
      permissions: payload.permissions || [],
      id_empleado: payload.id_empleado,
      id_cliente: payload.id_cliente,
    };
  }
}
