import { PrismaClient } from '@prisma/client';
import { PrismaPasswordResetTokenRepository } from '@/modules/auth/infrastructure/data/Prisma-passwordResetToken.repository';
import { hash } from 'bcryptjs';

export class ResetPasswordUseCase {
    private prisma: PrismaClient;
    private tokenRepo: PrismaPasswordResetTokenRepository;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        this.tokenRepo = new PrismaPasswordResetTokenRepository();
    }

    async execute(token: string, newPassword: string): Promise<void> {

        const resetToken = await this.tokenRepo.findByToken(token);
        if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
            throw new Error('Token inválido ou expirado');
        }

        const passwordHash = await hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        });

        await this.tokenRepo.markAsUsed(resetToken.id);
    }
} 