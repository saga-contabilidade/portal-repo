import { PrismaUserRepository } from '@/modules/auth/infrastructure/data/Prisma-user.repository';
import { JwtService } from '@/modules/auth/infrastructure/services/Jwt.service';
import bcrypt from 'bcrypt';
import { InvalidCredentialsError } from './error/InvalidCredentialsError';

type LoginInput = { email: string; password: string };
type LoginOutput = { token: string };

export class LoginUseCase {
  constructor(
    private userRepository: PrismaUserRepository,
    private authService: JwtService
  ) {}

  async execute({ email, password }: LoginInput): Promise<LoginOutput> {

    const user = await this.userRepository.findByEmail(email);

    const isPasswordValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const payload = {
      userId: user?.id,
      profile: user?.profile,
    };

    const token = this.authService.sign(payload);
    
    return { token };
  }
}