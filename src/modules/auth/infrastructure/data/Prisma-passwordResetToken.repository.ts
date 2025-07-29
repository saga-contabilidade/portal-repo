import { PrismaClient } from '@prisma/client';
import type { PasswordResetToken } from '@prisma/client';

export class PrismaPasswordResetTokenRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
        return this.prisma.passwordResetToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    }

    async findByToken(token: string): Promise<PasswordResetToken | null> {
        return this.prisma.passwordResetToken.findUnique({
            where: { token },
        });
    }

    async markAsUsed(id: string): Promise<void> {
        await this.prisma.passwordResetToken.update({
            where: { id },
            data: { used: true },
        });
    }

    async deleteExpired(): Promise<void> {
        await this.prisma.passwordResetToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
                used: false,
            },
        });
    }
} 