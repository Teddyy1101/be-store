import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from '../../model/entities/review.entities';
import { User } from '../../model/entities/user.entities';
import { Notification } from '../../model/entities/notification.entities';
import { ReviewImage } from '../../model/entities/review-image.entities';
import { OrderModule } from '../order/order.module';
import { Order } from '../../model/entities/order.entities';
import { ProductOption } from '../../model/entities/product-option.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewImage, Notification, User, Order, ProductOption]),
    OrderModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
