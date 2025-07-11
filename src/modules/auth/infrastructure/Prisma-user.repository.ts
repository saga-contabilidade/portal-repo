import { PrismaClient } from "@prisma/client";
import { User } from '@prisma/client';

const prisma = new PrismaClient();

export class PrismaUserRepository {
    async findByEmail(email: string): Promise<User | null >{
        return prisma.user.findUnique({
            where: { email }
        });
    }
}