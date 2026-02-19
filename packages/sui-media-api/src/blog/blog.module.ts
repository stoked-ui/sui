import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../media/guards/auth.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BlogController],
  providers: [BlogService, AuthGuard],
  exports: [BlogService],
})
export class BlogModule {}
