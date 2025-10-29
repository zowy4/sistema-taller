import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	// Validates a user by email + password. Returns user object or null
	async validateUserByEmail(email: string, plainTextPassword: string) {

		// Try to authenticate an employee first
		const empleado = await this.prisma.empleados.findUnique({ where: { email } as any });
		if (empleado && (empleado as any).password) {
			const isMatchEmp = await bcrypt.compare(plainTextPassword, (empleado as any).password);
			if (isMatchEmp) {
				const { password, ...safe } = empleado as any;
				return { ...safe, _type: 'empleado' };
			}
		}

		// Fallback to clientes
		const cliente = await this.prisma.clientes.findUnique({ where: { email } });
		if (cliente && (cliente as any).password) {
			const isMatchCli = await bcrypt.compare(plainTextPassword, (cliente as any).password);
			if (isMatchCli) {
				const { password, ...safe } = cliente as any;
				return { ...safe, _type: 'cliente' };
			}
		}

		return null;
	}

	// Create a JWT for a given user payload (expects at least id and email)
	async generateToken(payload: { id: number; email: string }) {
		const token = await this.jwtService.signAsync({ sub: payload.id, email: payload.email });
		return { access_token: token };
	}

	// Utility used by JwtStrategy if needed
	async validateUserById(id: number) {
		const empleado = await this.prisma.empleados.findUnique({ where: { id_empleado: id } as any });
		if (empleado) return empleado;

		const cliente = await this.prisma.clientes.findUnique({ where: { id_cliente: id } });
		if (cliente) return cliente;

		throw new UnauthorizedException();
	}
}
