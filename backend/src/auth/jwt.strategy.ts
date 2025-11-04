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

  // payload shape depends on how you sign the token in AuthService
  async validate(payload: any) {
    const userId = payload.sub ?? payload.id;
    if (!userId) throw new UnauthorizedException();

    // Return the payload data including rol and permissions
    // The JWT already contains all the user info we need
    return {
      id: userId,
      email: payload.email,
      rol: payload.rol,
      permissions: payload.permissions || [],
      id_empleado: payload.id_empleado,
    };
  }
}
