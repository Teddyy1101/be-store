import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './modules/product/product.module';
import { Product } from './model/entities/product.entities';
import { UploadController } from './modules/upload/upload.controller';
import { Brand } from './model/entities/brand.entities';
import { BrandModule } from './modules/brand/brand.module';
import { Category } from './model/entities/category.entities';
import { User } from './model/entities/user.entities';
import { CategoryModule } from './modules/category/category.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductImageModule } from './modules/product-image/product-image.module';
import { ProductSpecification } from './model/entities/product-spec.entities';
import { ProductSpecificationModule } from './modules/product-specification/product-specification.module';
import { ProductOption } from './model/entities/product-option.entities';
import { ProductOptionModule } from './modules/product-option/product-option.module';
import { Conversation } from './model/entities/conversation.entities';
import { Chat } from './model/entities/chat.entities';
import { ChatModule } from './modules/chat/chat.module';
import { Post } from './model/entities/post.entities';
import { PostModule } from './modules/post/post.module';
import { Banner } from './model/entities/banner.entities';
import { BannerModule } from './modules/banner/banner.module';
import { Review } from './model/entities/review.entities';
import { ReviewModule } from './modules/review/review.module';
import { Favorite } from './model/entities/favorite.entities';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { Store } from './model/entities/store.entities';
import { StoreModule } from './modules/store/store.module';
import { Discount } from './model/entities/discount.entities';
import { DiscountModule } from './modules/discount/discount.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { Warehouse } from './model/entities/warehouse.entities';
import { Cart } from './model/entities/cart.entities';
import { CartModule } from './modules/cart/cart.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { Order } from './model/entities/order.entities';
import { Payment } from './model/entities/payment.entities';
import { Notification } from './model/entities/notification.entities';
import { Shipping } from './model/entities/shipping.entities';
import { OrderModule } from './modules/order/order.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentModule } from './modules/payment/payment.module';
import { OrderDetail } from './model/entities/order-detail.entities';
import { OrderDetailModule } from './modules/order-detail/order-detail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        Product,
        Brand,
        Category,
        User,
        ProductSpecification,
        ProductOption,
        Chat,
        Conversation,
        Post,
        Banner,
        Review,
        Favorite,
        Store,
        Discount,
        Warehouse,
        Cart,
        Order,
        OrderDetail,
        Payment,
        Notification,
        Shipping,
      ],
      autoLoadEntities: true,
      synchronize: false,
      charset: 'utf8mb4',
      timezone: 'Z',
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    ProductModule,
    BrandModule,
    CategoryModule,
    UserModule,
    AuthModule,
    ProductImageModule,
    ProductSpecificationModule,
    ProductOptionModule,
    ChatModule,
    PostModule,
    BannerModule,
    ReviewModule,
    FavoriteModule,
    StoreModule,
    DiscountModule,
    WarehouseModule,
    CartModule,
    ShippingModule,
    OrderModule,
    NotificationModule,
    PaymentModule,
    OrderDetailModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
