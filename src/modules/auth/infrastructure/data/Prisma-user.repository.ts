import { PrismaClient } from "@prisma/client";
import { User } from '@prisma/client';

export class PrismaUserRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findByEmail(email: string): Promise<User | null >{
        return this.prisma.user.findUnique({
            where: { email }
        });
    }
}