import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateProductOptionDto {
  @IsNumber() 
  proId: number;

  @IsOptional() 
  @IsString() 
  rom?: string;

  @IsOptional() 
  @IsString() 
  color?: string;

  @IsOptional() 
  @IsNumber() 
  extraPrice?: number;

  @IsOptional() 
  @IsBoolean() 
  isActive?: boolean;
}

export class UpdateProductOptionDto extends CreateProductOptionDto {}
