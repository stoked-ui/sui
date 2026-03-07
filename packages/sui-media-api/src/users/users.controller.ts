import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '@stoked-ui/common-api';
import { AuthGuard } from '../media/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../media/decorators/current-user.decorator';

@Controller('users')
@ApiTags('Users')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @Get()
  @Roles('admin')
  async findAll(
    @Query('clientId') clientId?: string,
    @Query('role') role?: string,
  ): Promise<UserDocument[]> {
    const filter: any = {};
    if (clientId) filter.clientId = clientId;
    if (role) filter.role = role;
    return this.userModel.find(filter).select('-passwordHash').sort({ createdAt: -1 }).exec();
  }

  @Post()
  async create(
    @Body() body: any,
    @CurrentUser() currentUser: any,
  ): Promise<UserDocument> {
    const { email, password, name, role, clientId, agentIds, avatarUrl } = body;
    if (!email || !name) {
      throw new BadRequestException('Email and name are required');
    }

    // Client-role users can only create users for their own org
    if (currentUser.role === 'client') {
      if (role === 'admin' || role === 'agent') {
        throw new ForbiddenException('Cannot create admin or agent users');
      }
      if (clientId && clientId !== currentUser.clientId) {
        throw new ForbiddenException('Can only create users for your own organization');
      }
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const doc: any = {
      email: normalizedEmail,
      name,
      role: role || 'client',
      active: true,
    };
    if (avatarUrl) doc.avatarUrl = avatarUrl;
    if (password) doc.passwordHash = await bcrypt.hash(password, 10);
    
    const resolvedClientId = clientId || (currentUser.role === 'client' ? currentUser.clientId : undefined);
    if (resolvedClientId) doc.clientId = resolvedClientId;
    if (agentIds && Array.isArray(agentIds)) doc.agentIds = agentIds;

    const newUser = new this.userModel(doc);
    await newUser.save();
    
    const userObj = newUser.toObject();
    delete userObj.passwordHash;
    return userObj as UserDocument;
  }
}
