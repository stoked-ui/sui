import { ApiProperty } from '@nestjs/swagger';

export class LicenseResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  activatedAt?: Date;

  @ApiProperty({ required: false })
  expiresAt?: Date;

  @ApiProperty()
  gracePeriodDays: number;

  @ApiProperty({ required: false })
  machineName?: string;
}

export class CheckoutResponseDto {
  @ApiProperty({ description: 'Stripe checkout session URL' })
  checkoutUrl: string;

  constructor(checkoutUrl: string) {
    this.checkoutUrl = checkoutUrl;
  }
}
