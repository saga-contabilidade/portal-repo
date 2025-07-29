import { PrismaClient, ProfileType, Sector, StatusFinanceiro, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};

async function main() {
  console.log('Iniciando o seeding com o schema de Enums...');

  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cliente.deleteMany();
  console.log('Tabelas limpas.');

// 1. --- Cria um usuário admin para exemplo ---
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

// 2. --- Cria um usuário comum para exemplo ---
  const userPassword = await hashPassword('usuario123');
  await prisma.user.create({
    data: {
      name: 'Cesar Pisa',
      email: 'cesar.au563@gmail.com',
      passwordHash: userPassword,
      profile: ProfileType.COLABORADOR,
      sector: Sector.RH,
    },
  });
//3. --- Cria um cliente para exemplo ---
  const senhaGovExemploHash = await hashPassword('senhaGovDoCliente123');
  await prisma.cliente.create({
    data: {
      cod: 1001,
      nome: 'Cliente Exemplo S.A.',
      cpf: '111.222.333-44',
      senhaGovHash: senhaGovExemploHash,
      email: 'contato@clienteexemplo.com',
      telefone: '(11) 98765-4321',
      responsavel: 'Fulano de Tal',
      pendencias: 'Falta entregar o documento XYZ de 2024.',
      valorIR: new Prisma.Decimal(2540.50),
      status: StatusFinanceiro.EM_DIA,
    },
  });

  console.log('Usuários de exemplo criados.');
  console.log('Cliente de exemplo criado.');
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