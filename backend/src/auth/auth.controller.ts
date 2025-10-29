import { Body, Controller, Post, UnauthorizedException, Get, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { RegisterDto } from './dto/register.dto';
import { ClientsService } from '../clients/clients.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly clientsService: ClientsService,
	) {}

	/**
	 * POST /auth/login
	 * Body: { email, password }
	 */
	@Post('login')
	async login(@Body() dto: LoginDto) {
		const user = await this.authService.validateUserByEmail(dto.email, dto.password);
		if (!user) throw new UnauthorizedException('Credenciales inválidas');

		return this.authService.generateToken({ id: (user as any).id ?? (user as any).id_cliente, email: user.email });
	}

	/**
	 * POST /auth/register
	 * Crea un nuevo cliente. Usa el DTO `CreateClientDto`.
	 * Nota: si quieres manejar contraseñas, añade el campo `password` en el modelo y DTO.
	 */
		@Post('register')
		async register(@Body() dto: RegisterDto) {
			const client = await this.clientsService.createClient(dto as any);
		// No devolvemos campos sensibles si existieran
		const { password, ...safe } = client as any;
		return safe;
	}

	/**
	 * GET /auth/profile
	 * Devuelve la información del usuario extraída del JWT.
	 */
	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	profile(@Req() req: any) {
		return req.user;
	}

	/**
	 * POST /auth/logout
	 * Endpoint de conveniencia (logout típico se maneja en frontend destruyendo el token).
	 */
	@HttpCode(204)
	@Post('logout')
	logout() {
		return;
	}
}
