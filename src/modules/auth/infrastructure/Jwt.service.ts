import jwt, { SignOptions } from 'jsonwebtoken';

export class JwtService {
    sign(payload: object, expiresIn: string | number = '8h') : 
    string {
        const secret = process.env.JWT_SECRET as string;
        if (!secret){
            throw new Error('JWT Secret não definido!');
        }
        const options: SignOptions = {
            expiresIn: expiresIn as any,
        };

        return jwt.sign(payload, secret, options);
    }
}