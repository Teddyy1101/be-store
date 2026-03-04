import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateShippingDto {
  @IsNotEmpty()
  orderId: number;

  @IsNotEmpty()
  storeId: number;

  @IsNotEmpty()
  @IsString()
  shippingType: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;
}

export class UpdateShippingDto extends CreateShippingDto {}
