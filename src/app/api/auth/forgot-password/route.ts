import { NextRequest, NextResponse } from 'next/server';
import { ForgotPasswordUseCase } from '@/modules/auth/application/ForgotPassword-use.case';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
        }
        const useCase = new ForgotPasswordUseCase();
        await useCase.execute(email);
        // Sempre retorna sucesso para não expor se o e-mail existe
        return NextResponse.json({ message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Erro ao solicitar redefinição de senha.' }, { status: 500 });
    }
} 