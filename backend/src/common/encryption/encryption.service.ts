import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
	private readonly algorithm = 'aes-256-gcm';

	// In production, store this value in ENCRYPTION_KEY and rotate it with a key management policy.
	private readonly secret =
		process.env.ENCRYPTION_KEY || 'esta_es_una_llave_secreta_de_32b!';

	private readonly key = crypto
		.createHash('sha256')
		.update(this.secret, 'utf8')
		.digest();

	encrypt(text: string): string {
		try {
			const iv = crypto.randomBytes(12);
			const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

			let encrypted = cipher.update(text, 'utf8', 'hex');
			encrypted += cipher.final('hex');

			const authTag = cipher.getAuthTag().toString('hex');

			return `${iv.toString('hex')}:${authTag}:${encrypted}`;
		} catch {
			throw new InternalServerErrorException(
				'Error al cifrar los datos sensibles',
			);
		}
	}

	decrypt(encryptedData: string): string {
		try {
			const parts = encryptedData.split(':');
			if (parts.length !== 3) {
				throw new Error('Formato de cifrado invalido');
			}

			const iv = Buffer.from(parts[0], 'hex');
			const authTag = Buffer.from(parts[1], 'hex');
			const encryptedText = parts[2];

			const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
			decipher.setAuthTag(authTag);

			let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
			decrypted += decipher.final('utf8');

			return decrypted;
		} catch {
			throw new InternalServerErrorException(
				'Error al descifrar los datos: Integridad comprometida',
			);
		}
	}

	isEncrypted(value: string): boolean {
		const parts = value.split(':');
		if (parts.length !== 3) return false;
		const [iv, authTag, payload] = parts;
		return (
			/^[a-f0-9]+$/i.test(iv) &&
			/^[a-f0-9]+$/i.test(authTag) &&
			/^[a-f0-9]+$/i.test(payload)
		);
	}
}
