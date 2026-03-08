import {
	CanActivate,
	ExecutionContext,
	Injectable,
	TooManyRequestsException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
	RATE_LIMIT_METADATA,
	RateLimitOptions,
} from './rate-limit.decorator';

interface FixedWindowEntry {
	count: number;
	expiresAt: number;
}

interface RequestLike {
	ip?: string;
	method?: string;
	originalUrl?: string;
	url?: string;
	headers?: Record<string, string | string[] | undefined>;
	socket?: { remoteAddress?: string };
	route?: { path?: string };
	baseUrl?: string;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
	private static readonly store = new Map<string, FixedWindowEntry>();
	private static lastGcAt = Date.now();

	private static readonly DEFAULT_LIMIT = 100;
	private static readonly DEFAULT_WINDOW_SEC = 60;
	private static readonly GC_INTERVAL_MS = 30_000;

	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		if (context.getType<'http' | 'rpc' | 'ws'>() !== 'http') {
			return true;
		}

		this.runGarbageCollector();

		const request = context.switchToHttp().getRequest<RequestLike>();
		const config =
			this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_METADATA, [
				context.getHandler(),
				context.getClass(),
			]) ?? {
				limit: RateLimitGuard.DEFAULT_LIMIT,
				windowSec: RateLimitGuard.DEFAULT_WINDOW_SEC,
			};

		const limit =
			Number.isFinite(config.limit) && config.limit > 0
				? config.limit
				: RateLimitGuard.DEFAULT_LIMIT;
		const windowSec =
			Number.isFinite(config.windowSec) && config.windowSec > 0
				? config.windowSec
				: RateLimitGuard.DEFAULT_WINDOW_SEC;

		const now = Date.now();
		const windowMs = windowSec * 1000;
		const key = this.buildStorageKey(request);

		const current = RateLimitGuard.store.get(key);
		if (!current || current.expiresAt <= now) {
			RateLimitGuard.store.set(key, {
				count: 1,
				expiresAt: now + windowMs,
			});
			return true;
		}

		if (current.count >= limit) {
			const retryAfterSec = Math.max(
				1,
				Math.ceil((current.expiresAt - now) / 1000),
			);

			throw new TooManyRequestsException({
				message:
					'Demasiadas solicitudes en poco tiempo. Intenta nuevamente en unos segundos.',
				retryAfterSec,
				limit,
				windowSec,
			});
		}

		current.count += 1;
		return true;
	}

	private runGarbageCollector(): void {
		const now = Date.now();
		if (now - RateLimitGuard.lastGcAt < RateLimitGuard.GC_INTERVAL_MS) {
			return;
		}

		for (const [key, value] of RateLimitGuard.store.entries()) {
			if (value.expiresAt <= now) {
				RateLimitGuard.store.delete(key);
			}
		}

		RateLimitGuard.lastGcAt = now;
	}

	private buildStorageKey(request: RequestLike): string {
		const ip = this.extractIp(request);
		const method = (request.method ?? 'UNKNOWN').toUpperCase();
		const routePath = request.route?.path
			? `${request.baseUrl ?? ''}${request.route.path}`
			: request.originalUrl ?? request.url ?? 'unknown-route';

		return `${ip}:${method}:${routePath}`;
	}

	private extractIp(request: RequestLike): string {
		const xForwardedFor = request.headers?.['x-forwarded-for'];
		if (typeof xForwardedFor === 'string' && xForwardedFor.length > 0) {
			return xForwardedFor.split(',')[0].trim();
		}

		if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
			return xForwardedFor[0].split(',')[0].trim();
		}

		return request.ip ?? request.socket?.remoteAddress ?? 'unknown-ip';
	}
}
