import { PrismaClient, ProfileType, Sector } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};

async function main() {
  console.log('Iniciando o seeding com o schema de Enums...');

  await prisma.user.deleteMany();
  console.log('Tabela de usuários limpa.');

// 1. Cria um usuário admin para exemplo
  const adminPassword = await hashPassword('admin123');

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@saga.cnt.br',
      passwordHash: adminPassword,
      profile: ProfileType.ADMINISTRADOR, 
      sector: Sector.TI,      
    },
  });

// 2. Cria um usuário comum para exemplo
  const userPassword = await hashPassword('usuario123');

  await prisma.user.create({
    data: {
      name: 'Usuário Comum',
      email: 'usuario@saga.cnt.br',
      passwordHash: userPassword,
      profile: ProfileType.COLABORADOR,
      sector: Sector.RH,
    },
  });

  console.log('Usuários de exemplo criados.');
  console.log('Seeding finalizado com sucesso! ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });