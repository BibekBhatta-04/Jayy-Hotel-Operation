import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { LoginInput } from '../schemas/auth.schema';

export class AuthService {
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }
}

export const authService = new AuthService();
