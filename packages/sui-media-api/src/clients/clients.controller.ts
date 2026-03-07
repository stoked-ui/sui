import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '@stoked-ui/common-api';
import { AuthGuard } from '../media/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('clients')
@ApiTags('Clients')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientsController {
  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {}

  @Get()
  @Roles('admin')
  async findAll(): Promise<ClientDocument[]> {
    return this.clientModel.find().sort({ createdAt: -1 }).exec();
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: { name: string; contactEmail: string }): Promise<ClientDocument> {
    const { name, contactEmail } = body;
    if (!name || !contactEmail) {
      throw new BadRequestException('Name and contactEmail are required');
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const doc = new this.clientModel({ name, slug, contactEmail, active: true });
    return doc.save();
  }
}
