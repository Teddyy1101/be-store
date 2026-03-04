import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../model/entities/user.entities';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from '../../model/entities/post.entities';
import { Category } from '../../model/entities/category.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Category])],
  controllers: [PostController],
  providers: [PostService],
  exports: [TypeOrmModule],
})
export class PostModule {}
