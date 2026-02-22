import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryInvoicesDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'XferAll' })
  customer?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'xferall-biweekly' })
  configId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 20, default: 20 })
  limit?: number = 20;
}
