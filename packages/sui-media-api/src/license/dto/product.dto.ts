import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyPrefix: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ default: 'usd' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ default: 365 })
  @IsNumber()
  @IsOptional()
  licenseDurationDays?: number;

  @ApiProperty({ default: 14 })
  @IsNumber()
  @IsOptional()
  gracePeriodDays?: number;

  @ApiProperty({ default: 30 })
  @IsNumber()
  @IsOptional()
  trialDurationDays?: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
