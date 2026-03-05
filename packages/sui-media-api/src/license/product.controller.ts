import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '@stoked-ui/common-api';
import { StripeService } from './stripe.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
@ApiTags('Products')
export class ProductController {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    private readonly stripeService: StripeService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all products' })
  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('productId') productId: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ productId }).exec();
    if (!product) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }
    return product;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product with Stripe synchronization' })
  async create(@Body(ValidationPipe) dto: CreateProductDto): Promise<ProductDocument> {
    const existing = await this.productModel.findOne({ productId: dto.productId }).exec();
    if (existing) {
      throw new ConflictException(`Product already exists: ${dto.productId}`);
    }

    try {
      // 1. Create Stripe Product
      const stripeProduct = await this.stripeService.createProduct({
        productId: dto.productId,
        name: dto.name,
        description: dto.description,
      });

      // 2. Create Stripe Price
      const stripePrice = await this.stripeService.createPrice({
        productId: dto.productId,
        stripeProductId: stripeProduct.id,
        price: dto.price,
        currency: dto.currency || 'usd',
      });

      // 3. Save to MongoDB
      const doc = new this.productModel({
        ...dto,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      });
      return await doc.save();
    } catch (error: any) {
      throw new BadRequestException(`Failed to create product: ${error.message}`);
    }
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Update product and synchronize with Stripe' })
  async update(
    @Param('productId') productId: string,
    @Body(ValidationPipe) dto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ productId }).exec();
    if (!product) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }

    const update: any = { ...dto };

    // Handle price/currency change
    if ((dto.price !== undefined && dto.price !== product.price) || 
        (dto.currency !== undefined && dto.currency !== product.currency)) {
      try {
        const newPrice = dto.price !== undefined ? dto.price : product.price;
        const newCurrency = dto.currency !== undefined ? dto.currency : product.currency;
        
        let stripeProductId = product.stripeProductId;
        if (!stripeProductId) {
          const stripeProduct = await this.stripeService.createProduct({
            productId: product.productId,
            name: dto.name || product.name,
            description: dto.description || product.description,
          });
          stripeProductId = stripeProduct.id;
          update.stripeProductId = stripeProductId;
        }

        const stripePrice = await this.stripeService.createPrice({
          productId: product.productId,
          stripeProductId: stripeProductId,
          price: newPrice,
          currency: newCurrency,
        });

        update.stripePriceId = stripePrice.id;
      } catch (error: any) {
        throw new BadRequestException(`Failed to update Stripe price: ${error.message}`);
      }
    }

    const updated = await this.productModel.findOneAndUpdate(
      { productId },
      { $set: update },
      { new: true },
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }
    return updated;
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  async remove(@Param('productId') productId: string): Promise<void> {
    const result = await this.productModel.deleteOne({ productId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }
  }
}
