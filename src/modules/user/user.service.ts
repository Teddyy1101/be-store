import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../model/entities/user.entities';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async findAll(
    params: { page?: number; limit?: number; search?: string } = {},
  ): Promise<{ data: User[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.userRepo.createQueryBuilder('user').where('1=1');

    if (searchTerm) {
      query.andWhere(
        '(LOWER(user.fullName) LIKE :search OR LOWER(user.email) LIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    const [data, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { userId: id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async create(data: Partial<User>, avatarFile?: Express.Multer.File) {
    // Kiểm tra email đã tồn tại
    const exist = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (exist) throw new BadRequestException('Email đã tồn tại');

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Xử lý ảnh avatar nếu có
    let avatarUrl: string | undefined = undefined;
    if (avatarFile) {
      avatarUrl = `/uploads/avatars/${avatarFile.filename}`;
    }

    const now = new Date();

    // Tạo user mới
    const newUser = this.userRepo.create({
      ...data,
      password: hashedPassword,
      avatar: avatarUrl,
    });

    return await this.userRepo.save(newUser);
  }

  async update(
    id: number,
    data: Partial<User>,
    avatarFile?: Express.Multer.File,
  ) {
    const user = await this.findOne(id);

    if (data.email) {
      const emailExist = await this.userRepo.findOne({
        where: { email: data.email },
      });

      // Nếu email đã thuộc về 1 user khác
      if (emailExist && emailExist.userId !== id) {
        throw new BadRequestException('Email đã tồn tại');
      }
    }

    // ===== XỬ LÝ MẬT KHẨU =====
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // ===== XỬ LÝ ẢNH AVATAR =====
    if (avatarFile) {
      const avatarUrl = `/uploads/avatars/${avatarFile.filename}`;
      data.avatar = avatarUrl;
    }

    Object.assign(user, data);

    return await this.userRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  async updateStatus(id: number, status: boolean): Promise<User> {
    const user = await this.userRepo.findOne({ where: { userId: id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    user.status = status;
    return this.userRepo.save(user);
  }

  async changeRole(id: number, role: string) {
    const user = await this.findOne(id);
    user.role = role;
    return await this.userRepo.save(user);
  }

  async getCurrentUser(token: string): Promise<Partial<User>> {
    try {
      if (!token) throw new UnauthorizedException('Token không được cung cấp');

      const cleanedToken = token.replace('Bearer ', '');
      const payload = this.jwtService.verify(cleanedToken);

      const user = await this.userRepo.findOne({
        where: { userId: payload.sub },
      });

      if (!user) throw new NotFoundException('User không tồn tại');
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
