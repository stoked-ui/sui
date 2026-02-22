import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TaskDto {
  @IsString()
  @ApiProperty({ example: 'Patient transfer dashboard development' })
  description: string;

  @IsNumber()
  @ApiProperty({ example: 8 })
  hours: number;
}

class WeekDto {
  @IsString()
  @ApiProperty({ example: 'February 17 - February 23, 2026' })
  dateRange: string;

  @IsNumber()
  @ApiProperty({ example: 30 })
  totalHours: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @ApiProperty({ type: [TaskDto] })
  tasks: TaskDto[];
}

export class CreateInvoiceDto {
  @IsString()
  @ApiProperty({ example: 'xferall-biweekly' })
  configId: string;

  @IsString()
  @ApiProperty({ example: 'XferAll' })
  customer: string;

  @IsString()
  @ApiProperty({ example: 'February 17, 2026' })
  startDate: string;

  @IsString()
  @ApiProperty({ example: 'March 2, 2026' })
  endDate: string;

  @IsString()
  @ApiProperty({ example: 'February 17 - February 23, 2026 ----- 30hrs\n...' })
  text: string;

  @IsNumber()
  @ApiProperty({ example: 60 })
  totalHours: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeekDto)
  @ApiProperty({ type: [WeekDto] })
  weeks: WeekDto[];

  @IsDateString()
  @ApiProperty({ example: '2026-02-21T12:00:00.000Z' })
  generatedAt: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2026-02-21T12:00:00.000Z' })
  sentAt?: string;
}
