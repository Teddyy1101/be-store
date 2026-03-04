import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from '../../model/entities/post.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../model/entities/user.entities';
import { CreatePostDto, UpdatePostDto } from '../../model/dto/post.dto';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { Category } from '../../model/entities/category.entities';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: any[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;

    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category');

    if (searchTerm) {
      query.andWhere(
        '(LOWER(post.title) LIKE :search OR LOWER(post.content) LIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    const [posts, total] = await query
      .orderBy('post.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    // Map dữ liệu giống findOne
    const data = posts.map((post) => ({
      postId: post.postId,
      title: post.title,
      slug: post.slug,
      thumbnail: post.thumbnail,
      content: post.content,
      excerpt: post.excerpt,
      isActive: post.isActive,
      createdAt: post.createdAt,
      author: {
        authorName: post.author?.fullName || null,
      },
      categoryId: post.category?.categoryId || null,
    }));

    return { data, total };
  }

  async findOne(slug: string): Promise<any> {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['author', 'category'],
    });

    if (!post) throw new NotFoundException('Không tìm thấy bài viết');

    return {
      postId: post.postId,
      title: post.title,
      slug: post.slug,
      thumbnail: post.thumbnail,
      content: post.content,
      excerpt: post.excerpt,
      isActive: post.isActive,
      createdAt: post.createdAt,

      author: {
        authorName: post.author?.fullName || null,
      },
      categoryId: post.category?.categoryId || null,
    };
  }

  async create(dto: CreatePostDto, thumbnailUrl?: string): Promise<Post> {
    // kiểm tra tiêu đề trùng
    const exist = await this.postRepo.findOne({ where: { title: dto.title } });
    if (exist) throw new BadRequestException('Slug đã tồn tại');

    // tìm tác giả
    const author = await this.userRepo.findOne({
      where: { userId: dto.authorId },
    });
    if (!author) throw new BadRequestException('Không tìm thấy tác giả');

    // tạo slug
    const nameWithoutAccents = dto.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
    const slug = slugify(nameWithoutAccents, { lower: true, strict: true });
    const category = await this.categoryRepo.findOne({
      where: { categoryId: dto.categoryId },
    });
    if (!category) throw new BadRequestException('Không tìm thấy danh mục');

    const post = this.postRepo.create({
      ...dto,
      slug,
      author,
      category,
      thumbnail: thumbnailUrl ?? undefined,
    });

    return await this.postRepo.save(post);
  }

  async update(
    slug: string,
    dto: UpdatePostDto,
    thumbnailUrl?: string,
  ): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (!post)
      throw new NotFoundException(`Không tìm thấy bài viết với slug ${slug}`);
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { categoryId: dto.categoryId },
      });
      if (!category) throw new BadRequestException('Không tìm thấy danh mục');
      post.category = category;
    }

    if (dto.title) {
      const exist = await this.postRepo.findOne({
        where: { title: dto.title },
      });
      if (exist && exist.slug !== slug)
        throw new BadRequestException('Tên bài viết đã tồn tại');

      const nameWithoutAccents = dto.title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      post.slug = slugify(nameWithoutAccents, { lower: true, strict: true });
      post.title = dto.title;
    }

    if (dto.authorId) {
      const author = await this.userRepo.findOne({
        where: { userId: dto.authorId },
      });
      if (!author) throw new BadRequestException('Không tìm thấy tác giả');
      post.author = author;
    }

    Object.assign(post, dto);

    if (thumbnailUrl) {
      post.thumbnail = thumbnailUrl;
    }

    post.updatedAt = new Date();
    return await this.postRepo.save(post);
  }

  async remove(id: number): Promise<{ message: string }> {
    const post = await this.postRepo.findOne({ where: { postId: id } });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết có ID: ${id}`);
    }
    const result = await this.postRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy bài viết có ID: ${id}`);
    }

    return { message: `Xóa bài viết "${post.title}" thành công` };
  }

  async changeStatus(id: number, isActive: boolean): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { postId: id },
    });

    if (!post) throw new NotFoundException('Không tìm thấy bài viết');

    post.isActive = isActive;
    post.updatedAt = new Date();

    return await this.postRepo.save(post);
  }
}
