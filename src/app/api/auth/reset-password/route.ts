import { NextRequest, NextResponse } from 'next/server';
import { ResetPasswordUseCase } from '@/modules/auth/application/ResetPassword-use.case';
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();
        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
        }
        const useCase = new ResetPasswordUseCase(prisma);
        await useCase.execute(token, newPassword);
        return NextResponse.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        return NextResponse.json({ error: error|| 'Erro ao redefinir senha.' }, { status: 400 });
    }
} 