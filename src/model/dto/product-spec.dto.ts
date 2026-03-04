import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateProductSpecificationDto {
  @IsNumber() 
  proId: number;

  @IsOptional() 
  @IsString() 
  os?: string;

  @IsOptional() 
  @IsString() 
  display?: string;

  @IsOptional() 
  @IsString() 
  cpu?: string;
  
  @IsOptional() 
  @IsString() 
  gpu?: string;

  @IsOptional() 
  @IsString() 
  ram?: string;

  @IsOptional() 
  @IsString() 
  rom?: string;

  @IsOptional() 
  @IsString() 
  cameraFront?: string;

  @IsOptional() 
  @IsString() 
  cameraRear?: string;

  @IsOptional() 
  @IsString() 
  battery?: string;

  @IsOptional() 
  @IsString() 
  weight?: string;

  @IsOptional() 
  @IsString() 
  size?: string;

  @IsOptional() 
  @IsString() 
  sim?: string;

  @IsOptional() 
  @IsString() 
  material?: string;
}

export class UpdateProductSpecificationDto extends CreateProductSpecificationDto {}
