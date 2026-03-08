import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_METADATA = 'rate_limit_config';

export interface RateLimitOptions {
	limit: number;
	windowSec: number;
}

export const RateLimit = (limit: number, windowSec: number) =>
	SetMetadata(RATE_LIMIT_METADATA, { limit, windowSec } as RateLimitOptions);
