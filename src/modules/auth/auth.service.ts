import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../model/entities/user.entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(data: Partial<User>) {
    const { email, password } = data;

    const exist = await this.userRepo.findOne({ where: { email } });
    if (exist) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const user = this.userRepo.create({
      ...data,
      password,
    });

    await this.userRepo.save(user);

    return {
      message: 'Đăng ký thành công',
      user,
    };
  }

  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }
    if (user.password !== password) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    return {
      message: 'Đăng nhập thành công',
      user,
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { userId } });
  }
}
