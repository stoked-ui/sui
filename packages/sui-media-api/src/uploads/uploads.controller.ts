import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { UploadsService } from './uploads.service';
import {
  InitiateUploadDto,
  InitiateUploadResponseDto,
  GetMoreUrlsDto,
  PartCompletionDto,
  UploadStatusResponseDto,
  PartCompletionResponseDto,
  CompleteUploadResponseDto,
  ActiveUploadsResponseDto,
  PresignedUrlDto,
} from './dto';

@Controller('uploads')
@ApiTags('Uploads')
@ApiBearerAuth('JWT-auth')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Initiate a new multipart upload
   */
  @Post('/initiate')
  @ApiOperation({
    summary: 'Initiate multipart upload',
    description:
      'Start a new resumable multipart upload. Returns presigned URLs for the first batch of parts.',
  })
  @ApiResponse({
    status: 201,
    description: 'Upload initiated successfully',
    type: InitiateUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async initiateUpload(
    @Req() req: ExpressRequest,
    @Body() dto: InitiateUploadDto,
  ): Promise<InitiateUploadResponseDto> {
    const userId = (req as any).user?.id || (req as any).user?.sub || 'anonymous';
    this.logger.log(
      `Initiating upload for user ${userId}, file: ${dto.filename}`,
    );

    return this.uploadsService.initiateUpload(userId, dto);
  }

  /**
   * Get upload status for resume
   */
  @Get('/:sessionId/status')
  @ApiOperation({
    summary: 'Get upload status',
    description:
      'Get the current status of an upload session, including pending parts and fresh presigned URLs for resume.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'includeUrls',
    required: false,
    type: Boolean,
    description:
      'Include fresh presigned URLs for pending parts (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload status retrieved',
    type: UploadStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Upload session not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to access this session',
  })
  async getUploadStatus(
    @Req() req: ExpressRequest,
    @Param('sessionId') sessionId: string,
    @Query('includeUrls') includeUrls?: string,
  ): Promise<UploadStatusResponseDto> {
    const userId = (req as any).user?.id || (req as any).user?.sub || 'anonymous';
    const shouldIncludeUrls = includeUrls !== 'false';

    return this.uploadsService.getUploadStatus(
      userId,
      sessionId,
      shouldIncludeUrls,
    );
  }

  /**
   * Sync with S3 and get updated status
   */
  @Post('/:sessionId/sync')
  @ApiOperation({
    summary: 'Sync upload with S3',
    description:
      'Synchronize the upload session with actual S3 state. Use this when resuming an upload to ensure consistency.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload synced and status retrieved',
    type: UploadStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Upload session not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Upload session expired or already completed',
  })
  async syncUpload(
    @Req() req: ExpressRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<UploadStatusResponseDto> {
    const userId = (req as any).user?.id || (req as any).user?.sub || 'anonymous';

    return this.uploadsService.syncWithS3(userId, sessionId);
  }

  /**
   * Request additional presigned URLs
   */
  @Post('/:sessionId/urls')
  @ApiOperation({
    summary: 'Get more presigned URLs',
    description:
      'Request additional presigned URLs for specific parts (max 50 per request).',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URLs generated',
    type: [PresignedUrlDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid part numbers or too many requested',
  })
  @ApiResponse({
    status: 409,
    description: 'Upload session is not active',
  })
  async getMoreUrls(
    @Req() req: ExpressRequest,
    @Param('sessionId') sessionId: string,
    @Body() dto: GetMoreUrlsDto,
  ): Promise<PresignedUrlDto[]> {
    const userId = (req as any).user?.id || (req as any).user?.sub || 'anonymous';

    return this.uploadsService.getMorePresignedUrls(
      userId,
      sessionId,
      dto.partNumbers,
    );
  }

  /**
   * Mark a part as completed
   */
  @Post('/:sessionId/parts/:partNumber/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark part as completed',
    description:
      'Confirm that a part has been successfully uploaded to S3 with its ETag.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'partNumber',
    description: 'Part number (1-based)',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Part marked as completed',
    type: PartCompletionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid part number or ETag',
  })
  @ApiResponse({
    status: 409,
    description: 'Upload session is not active',
  })
  async markPartCompleted(
    @Req() req: ExpressRequest,
    @Param('sessionId') sessionId: string,
    @Param('partNumber') partNumber: string,
    @Body() dto: PartCompletionDto,
  ): Promise<PartCompletionResponseDto> {
    const userId = (req as any).user?.id || (req as any).user?.sub || 'anonymous';
    const partNum = parseInt(partNumber, 10);

    if (isNaN(partNum) || partNum < 1) {
      throw new Error('Invalid part number');
    }

    return this.uploadsService.markPartCompleted(
      userId,
      sessionId,
      partNum,
      dto.etag,
    );
  }

  /**
   * Complete the multipart upload
   */
  @Post('/:sessionId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete upload',
    description:
      'Finalize the multipart upload after all parts have been uploaded. Creates the media document.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload completed successfully',
    type: CompleteUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Not all parts have been uploaded',
  })
  @ApiResponse({
    status: 409,
    description: 'Upload already completed or aborted',
  })
  async completeUpload(
    @Req() req: ExpressRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<CompleteUploadResponseDto> {
    const userId = (req as any).user?.id || (req as any).user?.sub || 'anonymous';

    return this.uploadsService.completeUpload(userId, sessionId);
  }

  /**
   * Abort an upload
   */
  @Delete('/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Abort upload',
    description: 'Cancel an in-progress upload and clean up S3 resources.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Upload aborted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Upload session not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot abort a completed upload',
  })
  async abortUpload(
    @Req() req: ExpressRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    const userId = (req as any).user?.id || (req as any).user?.sub || 'anonymous';

    await this.uploadsService.abortUpload(userId, sessionId);
  }

  /**
   * Get user's active uploads
   */
  @Get('/active')
  @ApiOperation({
    summary: 'List active uploads',
    description: 'Get all active (resumable) uploads for the current user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active uploads retrieved',
    type: ActiveUploadsResponseDto,
  })
  async getActiveUploads(
    @Req() req: ExpressRequest,
  ): Promise<ActiveUploadsResponseDto> {
    const userId = (req as any).user?.id || (req as any).user?.sub || 'anonymous';

    const uploads = await this.uploadsService.getActiveUploads(userId);

    return { uploads };
  }
}
