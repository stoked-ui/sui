import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import {
  InvoiceResponseDto,
  PaginatedInvoicesResponseDto,
} from './dto/invoice-response.dto';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthGuard } from '../media/guards/auth.guard';

@Controller('invoices')
@ApiTags('Invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', required: true })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  async findAll(
    @Query(ValidationPipe) query: QueryInvoicesDto,
  ): Promise<PaginatedInvoicesResponseDto> {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoicesService.findOne(id);
  }
}
