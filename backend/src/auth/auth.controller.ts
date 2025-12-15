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
	@Post('login')
	async login(@Body() dto: LoginDto) {
		const user = await this.authService.validateUserByEmail(dto.email, dto.password);
		if (!user) throw new UnauthorizedException('Credenciales invó¡lidas');
		return this.authService.generateToken({ 
			id: user.id, 
			email: user.email,
			rol: user.rol,
			permissions: user.permissions,
			id_empleado: user._type === 'empleado' ? user.id_empleado || user.id : undefined,
			id_cliente: user._type === 'cliente' ? user.id_cliente || user.id : undefined
		});
	}
		@Post('register')
		async register(@Body() dto: RegisterDto) {
			const client = await this.clientsService.createClient(dto as any);
		const { password, ...safe } = client as any;
		return safe;
	}
	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	profile(@Req() req: any) {
		return req.user;
	}
	@HttpCode(204)
	@Post('logout')
	logout() {
		return;
	}
}
