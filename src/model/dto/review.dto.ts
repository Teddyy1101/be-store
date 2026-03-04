import { 
  ArrayMaxSize, 
  IsArray, 
  IsInt, 
  IsOptional, 
  IsString, 
  Max, 
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsInt()
  @Type(() => Number)
  proId: number;

  @IsInt()
  @Type(() => Number)
  userId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  rating?: number = 0; // Default value

  @IsString()
  comment: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Chỉ được tải lên tối đa 5 ảnh' })
  imageUrls?: string[];
}

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Chỉ được tải lên tối đa 5 ảnh' })
  imageUrls?: string[];
}