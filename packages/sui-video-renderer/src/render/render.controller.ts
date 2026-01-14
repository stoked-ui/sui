import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RenderOrchestratorService } from './services/render-orchestrator.service';
import {
  VideoProjectDto,
  CreateRenderJobDto,
  RenderJobResponseDto,
  RenderJobStatusDto,
} from './dto';

/**
 * RenderController
 *
 * API endpoints for video rendering operations:
 * - Create and manage video projects
 * - Submit and monitor render jobs
 * - Query render status and results
 * - Cancel ongoing renders
 */
@ApiTags('render')
@Controller('render')
export class RenderController {
  private readonly logger = new Logger(RenderController.name);

  constructor(
    private readonly renderOrchestrator: RenderOrchestratorService,
  ) {}

  /**
   * Create a new video project
   * Stores project data for future rendering
   */
  @Post('projects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new video project' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid project data',
  })
  async createProject(@Body() projectDto: VideoProjectDto) {
    this.logger.log(`Creating project: ${projectDto.projectId}`);

    // TODO: Add authentication/authorization
    // TODO: Validate user permissions
    // TODO: Check project quota/limits

    return await this.renderOrchestrator.createProject(projectDto);
  }

  /**
   * Submit a render job
   * Queues a video project for rendering
   */
  @Post('jobs')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Submit a new render job' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Render job queued successfully',
    type: RenderJobResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  async createRenderJob(
    @Body() createJobDto: CreateRenderJobDto,
  ): Promise<RenderJobResponseDto> {
    this.logger.log(`Submitting render job for project: ${createJobDto.projectId}`);

    // TODO: Add authentication/authorization
    // TODO: Validate user owns the project
    // TODO: Check rendering quota/credits

    return await this.renderOrchestrator.createRenderJob(createJobDto);
  }

  /**
   * Get render job status
   * Returns current status, progress, and output URL when complete
   */
  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get render job status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job status retrieved successfully',
    type: RenderJobStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  async getJobStatus(@Param('jobId') jobId: string): Promise<RenderJobStatusDto> {
    this.logger.log(`Fetching status for job: ${jobId}`);

    // TODO: Add authentication/authorization
    // TODO: Verify user owns the job

    return await this.renderOrchestrator.getJobStatus(jobId);
  }

  /**
   * Get user's render jobs
   * Returns list of render jobs for the authenticated user
   */
  @Get('jobs')
  @ApiOperation({ summary: 'Get user render jobs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jobs retrieved successfully',
  })
  async getUserJobs(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`Fetching jobs for user: ${userId}`);

    // TODO: Add authentication/authorization
    // TODO: Get userId from authenticated user context

    return await this.renderOrchestrator.getUserJobs(userId, limit);
  }

  /**
   * Cancel a render job
   * Stops processing and marks job as canceled
   */
  @Delete('jobs/:jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a render job' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Job canceled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Job cannot be canceled in current state',
  })
  async cancelJob(
    @Param('jobId') jobId: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    this.logger.log(`Canceling job: ${jobId}`);

    // TODO: Add authentication/authorization
    // TODO: Get userId from authenticated user context

    await this.renderOrchestrator.cancelJob(jobId, userId);
  }

  /**
   * Health check endpoint
   * Returns service status and availability
   */
  @Get('health')
  @ApiOperation({ summary: 'Service health check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is healthy',
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'video-renderer',
      // TODO: Add more health metrics:
      // - Queue status and length
      // - Active processing jobs
      // - Storage availability
      // - FFmpeg availability
      // - System resources (CPU, memory, disk)
    };
  }
}
