import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '@stoked-ui/common-api';
import { LicenseService } from './license.service';
import { StripeService } from './stripe.service';
import { ActivateLicenseDto } from './dto/activate-license.dto';
import { ValidateLicenseDto } from './dto/validate-license.dto';
import { DeactivateLicenseDto } from './dto/deactivate-license.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { LicenseResponseDto, CheckoutResponseDto } from './dto/license-response.dto';

@Controller('licenses')
@ApiTags('Licenses')
export class LicenseController {
  constructor(
    private readonly licenseService: LicenseService,
    private readonly stripeService: StripeService,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Body(ValidationPipe) dto: ActivateLicenseDto,
  ): Promise<LicenseResponseDto> {
    return this.licenseService.activate(dto);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(
    @Body(ValidationPipe) dto: ValidateLicenseDto,
  ): Promise<LicenseResponseDto> {
    return this.licenseService.validate(dto);
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Body(ValidationPipe) dto: DeactivateLicenseDto,
  ): Promise<{ message: string }> {
    return this.licenseService.deactivate(dto);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkout(
    @Body(ValidationPipe) dto: CreateCheckoutDto,
  ): Promise<CheckoutResponseDto> {
    const product = await this.productModel.findOne({ productId: dto.productId }).exec();
    if (!product) {
      throw new NotFoundException(`Product not found: ${dto.productId}`);
    }
    const url = await this.stripeService.createCheckoutSession(dto, product);
    return new CheckoutResponseDto(url);
  }
}
