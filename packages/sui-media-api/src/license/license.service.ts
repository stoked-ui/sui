import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import {
  License,
  LicenseDocument,
  Product,
  ProductDocument,
} from '@stoked-ui/common-api';
import { ActivateLicenseDto } from './dto/activate-license.dto';
import { ValidateLicenseDto } from './dto/validate-license.dto';
import { DeactivateLicenseDto } from './dto/deactivate-license.dto';
import { LicenseResponseDto } from './dto/license-response.dto';

const KEY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);

  constructor(
    @InjectModel(License.name)
    private readonly licenseModel: Model<LicenseDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  generateKey(prefix: string): string {
    const bytes = crypto.randomBytes(8); // 64 bits, we use 60
    let result = prefix + '-';
    for (let group = 0; group < 3; group++) {
      for (let i = 0; i < 4; i++) {
        const idx = (group * 4 + i);
        // Use 5 bits per character from the random bytes
        const byteIndex = Math.floor((idx * 5) / 8);
        const bitOffset = (idx * 5) % 8;
        let value: number;
        if (bitOffset <= 3) {
          value = (bytes[byteIndex] >> (3 - bitOffset)) & 0x1f;
        } else {
          value = ((bytes[byteIndex] << (bitOffset - 3)) | (bytes[byteIndex + 1] >> (11 - bitOffset))) & 0x1f;
        }
        result += KEY_ALPHABET[value];
      }
      if (group < 2) result += '-';
    }
    return result;
  }

  private toLicenseResponse(doc: LicenseDocument): LicenseResponseDto {
    const resp = new LicenseResponseDto();
    resp.key = doc.key;
    resp.email = doc.email;
    resp.productId = doc.productId;
    resp.status = doc.status;
    resp.activatedAt = doc.activatedAt;
    resp.expiresAt = doc.expiresAt;
    resp.gracePeriodDays = doc.gracePeriodDays;
    resp.machineName = doc.machineName;
    return resp;
  }

  async activate(dto: ActivateLicenseDto): Promise<LicenseResponseDto> {
    const license = await this.licenseModel.findOne({ key: dto.key });
    if (!license) {
      throw new NotFoundException('License not found');
    }
    if (license.status === 'expired' || license.status === 'revoked') {
      throw new BadRequestException(`License is ${license.status}`);
    }
    // Idempotent: same hardware
    if (license.status === 'active' && license.hardwareId === dto.hardwareId) {
      return this.toLicenseResponse(license);
    }
    // Different hardware while active
    if (license.status === 'active' && license.hardwareId !== dto.hardwareId) {
      throw new ConflictException('License is already activated on a different device. Deactivate first.');
    }
    // Activate (pending → active)
    license.status = 'active';
    license.hardwareId = dto.hardwareId;
    license.machineName = dto.machineName || null;
    license.activatedAt = new Date();
    license.activationHistory.push(dto.hardwareId);
    await license.save();
    this.logger.log(`License ${license.key} activated for hardware ${dto.hardwareId}`);
    return this.toLicenseResponse(license);
  }

  async validate(dto: ValidateLicenseDto): Promise<LicenseResponseDto> {
    const license = await this.licenseModel.findOne({ key: dto.key });
    if (!license) {
      throw new NotFoundException('License not found');
    }
    if (license.hardwareId && license.hardwareId !== dto.hardwareId) {
      throw new ForbiddenException('Hardware ID mismatch');
    }
    // Check expiration with grace period
    if (license.expiresAt) {
      const graceMs = (license.gracePeriodDays || 0) * 24 * 60 * 60 * 1000;
      const expiryWithGrace = new Date(license.expiresAt.getTime() + graceMs);
      if (new Date() > expiryWithGrace && license.status !== 'expired') {
        license.status = 'expired';
        await license.save();
        this.logger.log(`License ${license.key} expired (past grace period)`);
      }
    }
    return this.toLicenseResponse(license);
  }

  async deactivate(dto: DeactivateLicenseDto): Promise<{ message: string }> {
    const license = await this.licenseModel.findOne({ key: dto.key });
    if (!license) {
      throw new NotFoundException('License not found');
    }
    if (license.status !== 'active') {
      throw new BadRequestException('License is not active');
    }
    if (license.hardwareId !== dto.hardwareId) {
      throw new ForbiddenException('Hardware ID mismatch');
    }
    if (license.deactivationCount >= 3) {
      throw new ForbiddenException('Deactivation limit reached (3 per year)');
    }
    license.hardwareId = null;
    license.machineName = null;
    license.status = 'pending';
    license.deactivationCount += 1;
    await license.save();
    this.logger.log(`License ${license.key} deactivated (count: ${license.deactivationCount})`);
    return { message: 'License deactivated successfully' };
  }

  async createLicense(
    email: string,
    productId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
  ): Promise<LicenseDocument> {
    const product = await this.productModel.findOne({ productId });
    if (!product) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + product.licenseDurationDays);

    // Retry up to 3 times for key collision
    for (let attempt = 0; attempt < 3; attempt++) {
      const key = this.generateKey(product.keyPrefix);
      try {
        const doc = await this.licenseModel.create({
          key,
          email,
          productId,
          status: 'pending',
          expiresAt,
          gracePeriodDays: product.gracePeriodDays,
          stripeCustomerId,
          stripeSubscriptionId,
        });
        this.logger.log(`License created: ${key} for ${email} (product: ${productId})`);
        return doc;
      } catch (err: any) {
        if (err.code === 11000 && attempt < 2) {
          this.logger.warn(`Key collision on attempt ${attempt + 1}, retrying...`);
          continue;
        }
        throw err;
      }
    }
    throw new BadRequestException('Failed to generate unique license key after 3 attempts');
  }

  async renewLicense(stripeSubscriptionId: string): Promise<void> {
    const license = await this.licenseModel.findOne({ stripeSubscriptionId });
    if (!license) {
      this.logger.warn(`No license found for subscription ${stripeSubscriptionId}`);
      return;
    }
    const product = await this.productModel.findOne({ productId: license.productId });
    const durationDays = product?.licenseDurationDays || 365;
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + durationDays);
    license.expiresAt = newExpiry;
    if (license.status === 'expired') {
      license.status = license.hardwareId ? 'active' : 'pending';
    }
    await license.save();
    this.logger.log(`License ${license.key} renewed until ${newExpiry.toISOString()}`);
  }

  async findBySubscriptionId(stripeSubscriptionId: string): Promise<LicenseDocument | null> {
    return this.licenseModel.findOne({ stripeSubscriptionId });
  }
}
