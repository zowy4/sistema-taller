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

    // Try empleados first
    const empleado = await this.prisma.empleados.findUnique({
      where: { id_empleado: Number(userId) } as any,
    });
    if (empleado) {
      return { id: empleado.id_empleado, email: (empleado as any).email, nombre: empleado.nombre, _type: 'empleado' };
    }

    const cliente = await this.prisma.clientes.findUnique({
      where: { id_cliente: Number(userId) },
    });
    if (cliente) {
      return { id: cliente.id_cliente, email: cliente.email, nombre: cliente.nombre, _type: 'cliente' };
    }

    throw new UnauthorizedException();
  }
}
