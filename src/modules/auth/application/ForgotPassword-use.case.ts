import { PrismaClient } from '@prisma/client';
import { PrismaPasswordResetTokenRepository } from '@/modules/auth/infrastructure/data/Prisma-passwordResetToken.repository';
import { MailtrapCloentService } from '@/modules/auth/infrastructure/services/Send.service';
import { randomUUID } from 'crypto';

export class ForgotPasswordUseCase {
    private prisma: PrismaClient;
    private tokenRepo: PrismaPasswordResetTokenRepository;
    private mailService: MailtrapCloentService;

    constructor() {
        this.prisma = new PrismaClient();
        this.tokenRepo = new PrismaPasswordResetTokenRepository();
        this.mailService = new MailtrapCloentService();
    }

    async execute(email: string): Promise<void> {

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {

            return;
        }

        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await this.tokenRepo.create(user.id, token, expiresAt);

        await this.mailService.sendPasswordResetEmail(user.email, user.name, token);
    }
} 