import { NextRequest, NextResponse } from 'next/server';
import { ForgotPasswordUseCase } from '@/modules/auth/application/ForgotPassword-use.case';
import { UserNotFoundError } from '@/modules/auth/application/errors/UserNotFoundError'

export async function POST(req: NextRequest) {
    let email: string;

    try {
        const body = await req.json();
        email  = body.email;

        if (!email) {
            return NextResponse.json(
                { error: 'E-mail é obrigatório.' }, 
                { status: 400 }
            );
        }

        const useCase = new ForgotPasswordUseCase();
        await useCase.execute(email);
        
        return NextResponse.json(
            { message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.' }
        );

    } catch (error: any) {

        if (error instanceof UserNotFoundError){
            return NextResponse.json(
                { message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.' }
            );
        }
        return NextResponse.json(
            {error: 'Ocorreu um erro inesperado ao processar a solicitação.' }, { status: 500 }
        )
    };
} 