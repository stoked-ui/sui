import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ActivateLicenseDto {
  @ApiProperty({ description: 'License key', example: 'FLUX-ABCD-EFGH-JKLM' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'SHA-256 of device identifier' })
  @IsString()
  hardwareId: string;

  @ApiProperty({ description: 'Human-readable machine name', required: false })
  @IsString()
  @IsOptional()
  machineName?: string;
}
