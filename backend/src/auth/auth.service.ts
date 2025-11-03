import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthorizationService } from './authorization.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly authorizationService: AuthorizationService,
	) {}

	async validateUserByEmail(email: string, plainTextPassword: string) {

		const empleado = await this.prisma.empleados.findUnique({ where: { email } as any });
		if (empleado && (empleado as any).password) {
			const isMatchEmp = await bcrypt.compare(plainTextPassword, (empleado as any).password);
			if (isMatchEmp) {
				const { password, ...safe } = empleado as any;
				const permissions = await this.authorizationService.getUserPermissions(safe.id_empleado, 'empleado');
				return { 
					...safe, 
					_type: 'empleado',
					permissions,
					id: safe.id_empleado
				};
			}
		}

		const cliente = await this.prisma.clientes.findUnique({ where: { email } });
		if (cliente && (cliente as any).password) {
			const isMatchCli = await bcrypt.compare(plainTextPassword, (cliente as any).password);
			if (isMatchCli) {
				const { password, ...safe } = cliente as any;
				const permissions = await this.authorizationService.getUserPermissions(safe.id_cliente, 'cliente');
				return { 
					...safe, 
					_type: 'cliente',
					permissions,
					id: safe.id_cliente
				};
			}
		}

		return null;
	}

	async generateToken(payload: { id: number; email: string; rol?: string; permissions?: string[]; id_empleado?: number }) {
		const token = await this.jwtService.signAsync({ 
			sub: payload.id, 
			email: payload.email,
			rol: payload.rol,
			permissions: payload.permissions,
			id_empleado: payload.id_empleado
		});
		return { access_token: token };
	}

	async validateUserById(id: number) {
		const empleado = await this.prisma.empleados.findUnique({ where: { id_empleado: id } as any });
		if (empleado) {
			const permissions = await this.authorizationService.getUserPermissions(id, 'empleado');
			return { ...empleado, permissions, _type: 'empleado' };
		}

		const cliente = await this.prisma.clientes.findUnique({ where: { id_cliente: id } });
		if (cliente) {
			const permissions = await this.authorizationService.getUserPermissions(id, 'cliente');
			return { ...cliente, permissions, _type: 'cliente' };
		}

		throw new UnauthorizedException();
	}
}
