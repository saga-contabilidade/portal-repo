import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@/config';

export class JwtService {
    sign<T extends object>(payload: T, expiresIn: string | number = '8h'): string {
        const secret = config.jwt.secret;
        const options: SignOptions = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expiresIn: expiresIn as any,
        };

        return jwt.sign(payload, secret, options);
    }
}