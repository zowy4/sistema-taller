import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthorizationService } from './authorization.service';
import { LoggerService } from '../common/logger/logger.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly authorizationService: AuthorizationService,
		private readonly logger: LoggerService,
	) {}
	async validateUserByEmail(email: string, plainTextPassword: string) {
		this.logger.debug(`Attempting authentication for email: ${email}`, 'AuthService');
		
		const empleado = await this.prisma.empleados.findUnique({ where: { email } as any });
		if (empleado && (empleado as any).password) {
			const isMatchEmp = await bcrypt.compare(plainTextPassword, (empleado as any).password);
			if (isMatchEmp) {
				const { password, ...safe } = empleado as any;
				const permissions = await this.authorizationService.getUserPermissions(safe.id_empleado, 'empleado');
				this.logger.logAuthentication(safe.id_empleado, 'Login as empleado', true);
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
				this.logger.logAuthentication(safe.id_cliente, 'Login as cliente', true);
				return { 
					...safe, 
					_type: 'cliente',
					rol: 'cliente',
					permissions,
					id: safe.id_cliente,
					id_cliente: safe.id_cliente
				};
			}
		}
		
		this.logger.warn(`Failed authentication attempt for email: ${email}`, 'AuthService');
		return null;
	}
	async generateToken(payload: { id: number; email: string; rol?: string; permissions?: string[]; id_empleado?: number; id_cliente?: number }) {
		const token = await this.jwtService.signAsync({ 
			sub: payload.id, 
			email: payload.email,
			rol: payload.rol,
			permissions: payload.permissions,
			id_empleado: payload.id_empleado,
			id_cliente: payload.id_cliente
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
