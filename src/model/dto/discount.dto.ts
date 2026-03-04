import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean, Min } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  discountType: 'PERCENT' | 'AMOUNT';

  @IsNumber()
  @Min(0)
  value: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;
}

export class UpdateDiscountDto extends CreateDiscountDto {}