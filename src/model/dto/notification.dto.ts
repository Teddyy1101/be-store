import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(['ORDER', 'MESSAGE', 'SYSTEM'])
  type: 'ORDER' | 'MESSAGE' | 'SYSTEM';

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  senderId?: number;

  @IsOptional()
  @IsNumber()
  receiverId?: number;

  @IsOptional()
  @IsNumber()
  relatedId?: number;

  @IsOptional()
  @IsEnum(['ORDER', 'REVIEW', 'PRODUCT', 'USER'])
  relatedType?: 'ORDER' | 'REVIEW' | 'PRODUCT' | 'USER';
}
export class UpdateNotificationDto extends CreateNotificationDto {
  @IsBoolean()
  isRead: boolean;
}
