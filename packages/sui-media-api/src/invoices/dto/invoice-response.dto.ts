import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TaskResponseDto {
  @ApiProperty()
  description: string;

  @ApiProperty()
  hours: number;
}

class WeekResponseDto {
  @ApiProperty()
  dateRange: string;

  @ApiProperty()
  totalHours: number;

  @ApiProperty({ type: [TaskResponseDto] })
  tasks: TaskResponseDto[];
}

export class InvoiceResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'xferall-biweekly' })
  configId: string;

  @ApiProperty({ example: 'XferAll' })
  customer: string;

  @ApiProperty({ example: 'February 17, 2026' })
  startDate: string;

  @ApiProperty({ example: 'March 2, 2026' })
  endDate: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ example: 60 })
  totalHours: number;

  @ApiProperty({ type: [WeekResponseDto] })
  weeks: WeekResponseDto[];

  @ApiProperty()
  generatedAt: Date;

  @ApiPropertyOptional()
  sentAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(doc: any) {
    this.id = doc.id ?? doc._id?.toString?.() ?? doc._id;
    this.configId = doc.configId;
    this.customer = doc.customer;
    this.startDate = doc.startDate;
    this.endDate = doc.endDate;
    this.text = doc.text;
    this.totalHours = doc.totalHours;
    this.weeks = doc.weeks ?? [];
    this.generatedAt = doc.generatedAt;
    this.sentAt = doc.sentAt;
    this.createdAt = doc.createdAt;
    this.updatedAt = doc.updatedAt;
  }
}

export class PaginatedInvoicesResponseDto {
  @ApiProperty({ type: [InvoiceResponseDto] })
  data: InvoiceResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: true })
  hasMore: boolean;

  constructor(data: any[], total: number, page: number, limit: number) {
    this.data = data.map((doc) => new InvoiceResponseDto(doc));
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.hasMore = page * limit < total;
  }
}
