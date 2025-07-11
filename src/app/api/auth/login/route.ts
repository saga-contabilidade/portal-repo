import { NextResponse } from 'next/server';
import { LoginUseCase } from '@/modules/auth/application/Login-use.case';
import { PrismaUserRepository } from '@/modules/auth/infrastructure/Prisma-user.repository';
import { JwtService } from '@/modules/auth/infrastructure/Jwt.service';


export async function POST(req: Request){
    const userRepository = new PrismaUserRepository();
    const authService = new JwtService();
    const loginUserCase = new LoginUseCase(userRepository, authService);

    try {
        const { email, password } = await req.json();

        if (!email || !password){
            return NextResponse.json({
                error: 'Email e senha são obrigatórios.'
            }, {status: 400});
        }

        const output = await loginUserCase.execute({ email, password });

        return NextResponse.json(output, { status: 200});
    } catch(error: any){
        if (error.message === 'Credenciais inválidas.'
        ){
            return NextResponse.json({
                error:error.message
            }, { status: 401});
        }

        console.error('Erro inesperado no login:', error);

        return NextResponse.json({
            error:'Erro interno do servidor.'
        }, {status:500});
    }
}