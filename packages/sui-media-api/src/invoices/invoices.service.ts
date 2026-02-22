import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '@stoked-ui/common-api';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import {
  InvoiceResponseDto,
  PaginatedInvoicesResponseDto,
} from './dto/invoice-response.dto';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const doc = await this.invoiceModel.create({
      configId: dto.configId,
      customer: dto.customer,
      startDate: dto.startDate,
      endDate: dto.endDate,
      text: dto.text,
      totalHours: dto.totalHours,
      weeks: dto.weeks,
      generatedAt: new Date(dto.generatedAt),
      sentAt: dto.sentAt ? new Date(dto.sentAt) : undefined,
    });

    this.logger.log(
      `Invoice created for ${dto.customer} (${dto.startDate} - ${dto.endDate})`,
    );

    return new InvoiceResponseDto(doc);
  }

  async findAll(
    query: QueryInvoicesDto,
  ): Promise<PaginatedInvoicesResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.customer) filter['customer'] = query.customer;
    if (query.configId) filter['configId'] = query.configId;

    const [docs, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.invoiceModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedInvoicesResponseDto(docs, total, page, limit);
  }

  async findOne(id: string): Promise<InvoiceResponseDto> {
    const doc = await this.invoiceModel.findById(id).exec();

    if (!doc) {
      throw new NotFoundException(`Invoice with id "${id}" not found`);
    }

    return new InvoiceResponseDto(doc);
  }
}
