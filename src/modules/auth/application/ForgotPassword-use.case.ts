import { PrismaClient } from '@prisma/client';
import { PrismaPasswordResetTokenRepository } from '@/modules/auth/infrastructure/data/Prisma-passwordResetToken.repository';
import { MailtrapClientService } from '@/modules/auth/infrastructure/services/Send.service';
import { randomUUID } from 'crypto';
import { UserNotFoundError } from './error/UserNotFoundError';

export class ForgotPasswordUseCase {
    private prisma: PrismaClient;
    private tokenRepo: PrismaPasswordResetTokenRepository;
    private mailService: MailtrapClientService;

    constructor() {
        this.prisma = new PrismaClient();
        this.tokenRepo = new PrismaPasswordResetTokenRepository();
        this.mailService = new MailtrapClientService();
    }

    async execute(email: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UserNotFoundError();
        }

        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

        await this.tokenRepo.create(user.id, token, expiresAt);

        try {
            await this.mailService.sendPasswordResetEmail(user.email, user.name, token);
        
        } catch (error) {
            console.error('--- ERRO AO ENVIAR E-MAIL ---');
            console.error(error);
        }
    }
}