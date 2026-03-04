import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../model/entities/review.entities';
import { ReviewImage } from '../../model/entities/review-image.entities';
import { User } from '../../model/entities/user.entities';
import { Order } from '../../model/entities/order.entities';
import { ProductOption } from '../../model/entities/product-option.entities'; // ✅ Thêm entity này
import { CreateReviewDto } from '../../model/dto/review.dto';
import { Notification } from '../../model/entities/notification.entities';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(ReviewImage)
    private imageRepo: Repository<ReviewImage>,
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(ProductOption) // ✅ Inject ProductOption repo
    private optionRepo: Repository<ProductOption>,
  ) {}

  async create(dto: CreateReviewDto) {
    // Kiểm tra nếu là đánh giá (rating > 0) thì phải mua hàng
    if (dto.rating && dto.rating > 0) {
      const hasPurchased = await this.checkUserPurchased(dto.userId, dto.proId);
      if (!hasPurchased) {
        throw new ForbiddenException(
          'Bạn cần mua sản phẩm này trước khi đánh giá',
        );
      }
    }

    const reviewData = {
      ...dto,
      rating: dto.rating || 0,
      user: { userId: dto.userId },
      pro: { proId: dto.proId },
    };

    if (dto.parentId) {
      (reviewData as any).parent = { reviewId: dto.parentId };
    }

    const review = this.reviewRepo.create(reviewData);
    const savedReview = await this.reviewRepo.save(review);

    // 🖼️ Lưu tối đa 5 ảnh
    if (dto.imageUrls && dto.imageUrls.length > 0) {
      const urls = dto.imageUrls.slice(0, 5);
      const images = urls.map((url) =>
        this.imageRepo.create({
          review: savedReview,
          imageUrl: url,
        }),
      );
      await this.imageRepo.save(images);
    }

    // 🔔 Gửi thông báo
    if (dto.parentId) {
      const parent = await this.reviewRepo.findOne({
        where: { reviewId: dto.parentId },
        relations: ['user'],
      });
      if (parent && parent.user.userId !== dto.userId) {
        await this.notiRepo.save({
          type: 'MESSAGE',
          title: 'Có người trả lời bình luận của bạn',
          content: dto.comment,
          sender: { userId: dto.userId },
          receiver: { userId: parent.user.userId },
          relatedId: savedReview.reviewId,
          relatedType: 'REVIEW',
        });
      }
    } else if (dto.rating && dto.rating > 0) {
      const admins = await this.userRepo.find({ where: { role: 'admin' } });
      for (const admin of admins) {
        await this.notiRepo.save({
          type: 'SYSTEM',
          title: 'Người dùng mới đánh giá sản phẩm',
          content: `Sản phẩm #${dto.proId} vừa được đánh giá ${dto.rating} sao`,
          sender: { userId: dto.userId },
          receiver: { userId: admin.userId },
          relatedId: savedReview.reviewId,
          relatedType: 'REVIEW',
        });
      }
    }

    return savedReview;
  }

  /**
   * ✅ Check xem user đã mua sản phẩm (proId) chưa
   * Bằng cách tìm các đơn hàng COMPLETED có chứa bất kỳ option nào thuộc sản phẩm này
   */
  private async checkUserPurchased(
    userId: number,
    proId: number,
  ): Promise<boolean> {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .innerJoin('order.orderDetails', 'detail')
      .innerJoin('detail.option', 'option') // ✅ Join với ProductOption
      .where('order.userId = :userId', { userId })
      .andWhere('option.proId = :proId', { proId }) // ✅ Check theo proId
      .andWhere('order.status = :status', { status: 'COMPLETED' })
      .getOne();

    return !!order;
  }

  async update(
    reviewId: number,
    userId: number,
    updateData: {
      comment?: string;
      rating?: number;
      imageUrls?: string[];
    },
  ) {
    // ✅ Load review với tất cả relations cần thiết
    const review = await this.reviewRepo.findOne({
      where: { reviewId },
      relations: ['user', 'images', 'pro'],
    });

    if (!review) throw new NotFoundException('Không tìm thấy bình luận');
    
    if (review.user.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa bình luận này',
      );
    }

    // Kiểm tra nếu cập nhật rating từ 0 -> >0
    if (
      updateData.rating !== undefined &&
      updateData.rating > 0 &&
      review.rating === 0
    ) {
      const hasPurchased = await this.checkUserPurchased(
        userId,
        review.pro.proId,
      );
      if (!hasPurchased) {
        throw new ForbiddenException(
          'Bạn cần mua sản phẩm này trước khi đánh giá',
        );
      }
    }

    // ✅ Chỉ cập nhật nếu có thay đổi thực sự
    let hasChanges = false;

    if (updateData.comment !== undefined && updateData.comment !== review.comment) {
      review.comment = updateData.comment;
      hasChanges = true;
    }

    if (updateData.rating !== undefined && updateData.rating !== review.rating) {
      review.rating = updateData.rating;
      hasChanges = true;
    }

    // ✅ Xử lý images riêng biệt
    if (updateData.imageUrls !== undefined) {
      const newUrls = updateData.imageUrls.slice(0, 5);

      // Xóa ảnh cũ nếu có
      if (review.images && review.images.length > 0) {
        await this.imageRepo.remove(review.images);
      }

      // Thêm ảnh mới
      if (newUrls.length > 0) {
        const newImages = newUrls.map((url) =>
          this.imageRepo.create({
            review: { reviewId: review.reviewId },
            imageUrl: url,
          }),
        );
        await this.imageRepo.save(newImages);
      }
    }

    // ✅ Chỉ save review nếu có thay đổi về comment hoặc rating
    if (hasChanges) {
      await this.reviewRepo.save(review);
    }

    // ✅ Load lại review với images mới
    const updated = await this.reviewRepo.findOne({
      where: { reviewId },
      relations: ['user', 'images', 'pro'],
    });

    return updated;
  }

  async deleteReview(userId: number, reviewId: number, isAdmin: boolean) {
    const review = await this.reviewRepo.findOne({
      where: { reviewId },
      relations: ['user'],
    });
    if (!review) throw new NotFoundException('Không tìm thấy bình luận');
    if (!isAdmin && review.user.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }
    return this.reviewRepo.remove(review);
  }

  async getReviewsByProduct(proId: number) {
    return this.reviewRepo.find({
      where: {
        pro: { proId },
        isVisible: true,
      },
      relations: ['user', 'replies', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRatingSummary(proId: number) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('ROUND(AVG(review.rating), 1)', 'avgRating')
      .addSelect('COUNT(review.rating)', 'totalReviews')
      .where('review.proId = :proId', { proId })
      .andWhere('review.rating > 0')
      .andWhere('review.isVisible = true')
      .getRawOne();

    return {
      proId,
      avgRating: Number(result.avgRating || 0),
      totalReviews: Number(result.totalReviews || 0),
    };
  }

  async checkPurchaseStatus(userId: number, proId: number) {
    const hasPurchased = await this.checkUserPurchased(userId, proId);
    return { hasPurchased };
  }
}