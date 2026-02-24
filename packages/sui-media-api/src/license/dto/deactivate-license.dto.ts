import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeactivateLicenseDto {
  @ApiProperty({ description: 'License key' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'SHA-256 of device identifier' })
  @IsString()
  hardwareId: string;
}
