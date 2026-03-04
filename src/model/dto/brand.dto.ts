import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  brandName: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  brandLogo?: string;

  @IsOptional( )
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBrandDto extends CreateBrandDto {}
