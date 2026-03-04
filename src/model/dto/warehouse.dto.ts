import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateWarehouseDto {
  @IsNumber()
  optionId: number;

  @IsNumber()
  storeId: number;

  @IsOptional()
  @IsNumber()
  importPrice?: number;

  @IsOptional()
  @IsNumber()
  baseSalePrice?: number;

  @IsPositive()
  quantity: number;
}
export class UpdateWarehouseDto extends CreateWarehouseDto {}