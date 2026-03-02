import { Body, Controller, Post, UnauthorizedException, Get, UseGuards, Req, Res, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { RegisterDto } from './dto/register.dto';
import { ClientsService } from '../clients/clients.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly clientsService: ClientsService,
	) {}

	@Post('login')
	async login(@Body() dto: LoginDto) {
		const user = await this.authService.validateUserByEmail(dto.email, dto.password);
		if (!user) throw new UnauthorizedException('Credenciales inválidas');
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

	/* OAuth 2.0 - Google */
	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() req: any) {
		// Las credenciales de Google se manejan automáticamente por Passport
		// Este endpoint redirige a Google OAuth
	}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
		try {
			// req.user contiene el perfil de Google validado
			const googleProfile = req.user;

			// Buscar o crear el usuario en la BD
			const user = await this.authService.findOrCreateOAuthUser(
				googleProfile.email,
				{
					firstName: googleProfile.firstName,
					lastName: googleProfile.lastName,
					picture: googleProfile.picture,
					provider: 'google',
				},
			);

			// Generar JWT estándar
			const token = await this.authService.generateToken({
				id: user.id,
				email: user.email,
				rol: user.rol,
				permissions: user.permissions,
			});

			// Guardar JWT en una Cookie HttpOnly (Mejor práctica de seguridad)
			res.cookie('access_token', token.access_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
			});

			// Redirigir al dashboard del frontend con el token en query string
			// (Alternativa: enviar el token directamente en la respuesta)
			return res.redirect(
				`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard?token=${token.access_token}`,
			);
		} catch (error) {
			console.error('Error en Google OAuth callback:', error);
			return res.redirect(
				`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`,
			);
		}
	}

	/* OAuth 2.0 - GitHub */
	@Get('github')
	@UseGuards(AuthGuard('github'))
	async githubAuth(@Req() req: any) {
		// Las credenciales de GitHub se manejan automáticamente por Passport
		// Este endpoint redirige a GitHub OAuth
	}

	@Get('github/callback')
	@UseGuards(AuthGuard('github'))
	async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
		try {
			// req.user contiene el perfil de GitHub validado
			const githubProfile = req.user;

			// Buscar o crear el usuario en la BD
			const user = await this.authService.findOrCreateOAuthUser(
				githubProfile.email,
				{
					firstName: githubProfile.username,
					lastName: '', // GitHub no proporciona apellido
					picture: githubProfile.picture,
					provider: 'github',
				},
			);

			// Generar JWT estándar
			const token = await this.authService.generateToken({
				id: user.id,
				email: user.email,
				rol: user.rol,
				permissions: user.permissions,
			});

			// Guardar JWT en una Cookie HttpOnly (Mejor práctica de seguridad)
			res.cookie('access_token', token.access_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
			});

			// Redirigir al dashboard del frontend
			return res.redirect(
				`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard?token=${token.access_token}`,
			);
		} catch (error) {
			console.error('Error en GitHub OAuth callback:', error);
			return res.redirect(
				`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`,
			);
		}
	}
}
