import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsUrl } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Product identifier', example: 'flux' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Customer email for Stripe' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Redirect URL after successful checkout' })
  @IsUrl()
  successUrl: string;

  @ApiProperty({ description: 'Redirect URL after cancelled checkout' })
  @IsUrl()
  cancelUrl: string;
}
