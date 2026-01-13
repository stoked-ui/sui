---
productId: editor
title: Backend Video Processing
githubLabel: 'component: Editor'
components: Editor
packageName: '@stoked-ui/editor'
---

# Backend Video Processing

<p class="description">Learn how to integrate the Stoked UI Editor with cloud-based video processing systems for production-grade video workflows.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Overview

The Stoked UI Editor provides a powerful client-side video editing experience, but production applications often require server-side video processing for tasks like transcoding, watermarking, format conversion, and optimization. This guide demonstrates how to integrate the editor with cloud-based video processing systems using AWS Elastic Container Service (ECS), enabling you to build scalable, production-ready video workflows.

Backend video processing offers several advantages over client-side processing: it removes computational burden from user devices, ensures consistent output quality, supports advanced encoding formats and codecs, enables batch processing, and provides better control over resource allocation and costs. For social media platforms, dating apps, and content creation tools, server-side processing is essential for handling high-volume video uploads while maintaining a responsive user experience.

This documentation covers the complete integration architecture from the editor's export functionality through cloud processing to final delivery. You'll learn how to design a four-stage workflow (Upload → Processing → Storage → Download), implement real-time progress tracking, handle errors gracefully, and optimize costs. The patterns shown here are framework-agnostic and can be adapted to other cloud providers like Google Cloud Run or Azure Container Instances, though we focus on AWS for its mature video processing ecosystem.

## Architecture Overview

The backend video processing architecture consists of four main components working together to transform editor output into production-ready video files:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   Editor    │──1──>│  API Gateway │──2──>│  ECS Task   │──3──>│     S3      │
│  (Client)   │<─────│   (Backend)  │<─────│ (Processing)│      │  (Storage)  │
└─────────────┘  4   └──────────────┘      └─────────────┘      └─────────────┘
     │                                                                   │
     └────────────────────────5: Download URL────────────────────────────┘
```

**Stage 1: Upload** - The editor exports the video project as JSON metadata (timeline, tracks, actions) and the client uploads this to your API endpoint along with a reference to the source video file.

**Stage 2: Processing Request** - Your API Gateway validates the request, generates a unique job ID, and triggers an ECS task with the processing parameters. The task runs in an isolated container with FFmpeg or other video processing tools.

**Stage 3: Processing & Storage** - The ECS task downloads source assets, applies transformations (cuts, transitions, filters), renders the final video, and uploads the result to S3. Progress updates are sent to a WebSocket or polling endpoint.

**Stage 4: Download** - Once processing completes, the API returns a signed S3 URL or CloudFront distribution URL, allowing the client to download or stream the processed video.

This architecture scales horizontally (multiple concurrent ECS tasks), provides fault tolerance (task retries, dead letter queues), and separates concerns (API handles business logic, ECS handles compute-intensive work). For more details on AWS ECS, see [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/), and for S3 integration, see [AWS S3 Documentation](https://docs.aws.amazon.com/s3/).

## Processing Stages

### Stage 1: Upload

The upload stage begins when the user clicks "Process Video" in the editor. The client application exports the editor state using the `editorFile.export()` method, which produces a JSON representation of the timeline including all tracks, actions, and metadata. This JSON payload is typically 5-50KB depending on project complexity.

Your client-side code then uploads this JSON along with references to source media files to your API endpoint. For large video files (>100MB), implement multipart uploads or presigned S3 PUT URLs to avoid gateway timeouts. The upload should include metadata like desired output format (mp4, webm), resolution (1080p, 720p), quality settings, and any custom filters or effects.

Progress tracking during upload is essential for user experience. Use `XMLHttpRequest` or `fetch` with progress events to display upload percentage. Most modern applications show a progress bar advancing from 0-100% with real-time speed estimates. Implement client-side retries for failed uploads with exponential backoff (1s, 2s, 4s, 8s delays).

### Stage 2: Processing

Once the upload completes and your API validates the payload, it triggers an ECS task to perform the actual video processing. The ECS task definition specifies a Docker container with FFmpeg, video codecs, and any custom processing scripts. AWS Fargate is recommended for on-demand task execution without managing EC2 instances.

The task downloads source assets from S3, applies transformations specified in the editor JSON (trimming, transitions, filters), and renders frames sequentially. FFmpeg command examples are provided in the Code Examples section below. Processing time varies dramatically: a 30-second 1080p video with basic cuts might process in 15-30 seconds, while complex multi-track compositions with effects can take 2-5 minutes.

Progress tracking during processing requires a communication channel between the ECS task and your API. Common approaches include: polling a DynamoDB table where the task writes progress percentages, using AWS EventBridge to emit progress events, or implementing a WebSocket connection for real-time updates. The task should report progress at least every 5-10 seconds to maintain responsive UI feedback.

### Stage 3: S3 Storage

After rendering completes, the ECS task uploads the final video file to S3 using the AWS SDK. Use multipart uploads for files >100MB to improve reliability and enable pause/resume functionality. Set appropriate S3 storage class based on access patterns: Standard for frequently accessed videos, Infrequent Access for archive content, or Glacier for long-term backup.

Configure S3 bucket policies to restrict public access while allowing authenticated downloads via presigned URLs. Enable versioning if you need to support multiple renditions or processing retries. For global distribution, configure CloudFront as a CDN in front of S3 to reduce latency and bandwidth costs.

The storage stage typically completes in 5-30 seconds depending on file size and network bandwidth. Include retry logic for failed S3 uploads with exponential backoff. Once the upload succeeds, the task updates the job status in your database and triggers a completion notification.

### Stage 4: Download

The final stage delivers the processed video to the user. Your API generates a presigned S3 URL with a limited TTL (typically 1-24 hours) that grants temporary download access without exposing S3 credentials. For public videos, consider using CloudFront signed URLs for better performance and advanced features like DRM protection.

The client receives the download URL and can either trigger an immediate download or display a preview player. For large files, implement range requests to support video streaming and allow users to seek without downloading the entire file. Modern browsers handle this automatically with the HTML5 `<video>` element.

Monitor download analytics to track bandwidth usage and optimize costs. Consider implementing a progressive download strategy where the client streams the video while downloading, improving perceived performance. For production systems, add download expiration notifications and automatic cleanup of temporary processing artifacts after 7-30 days.

## Code Examples

### API Endpoint - Processing Request

This Next.js API route handler demonstrates how to accept a video processing request from the editor, validate the payload, and trigger an ECS task:

```typescript
// pages/api/video/process.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { v4 as uuidv4 } from 'uuid';

const ecsClient = new ECSClient({ region: process.env.AWS_REGION });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { editorState, outputFormat, resolution } = req.body;

  // Validate required fields
  if (!editorState || !outputFormat) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const jobId = uuidv4();

  // Trigger ECS task for video processing
  const command = new RunTaskCommand({
    cluster: process.env.ECS_CLUSTER_ARN,
    taskDefinition: process.env.ECS_TASK_DEFINITION,
    launchType: 'FARGATE',
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [process.env.SUBNET_ID!],
        securityGroups: [process.env.SECURITY_GROUP_ID!],
        assignPublicIp: 'ENABLED',
      },
    },
    overrides: {
      containerOverrides: [{
        name: 'video-processor',
        environment: [
          { name: 'JOB_ID', value: jobId },
          { name: 'EDITOR_STATE', value: JSON.stringify(editorState) },
          { name: 'OUTPUT_FORMAT', value: outputFormat },
          { name: 'RESOLUTION', value: resolution || '1080p' },
        ],
      }],
    },
  });

  try {
    const response = await ecsClient.send(command);
    return res.status(200).json({
      jobId,
      taskArn: response.tasks?.[0]?.taskArn,
      status: 'processing',
    });
  } catch (error) {
    console.error('Failed to start ECS task:', error);
    return res.status(500).json({ error: 'Failed to start processing' });
  }
}
```

### Progress Tracking - Polling Implementation

This client-side hook demonstrates how to poll for processing progress and update the UI:

```typescript
// hooks/useVideoProcessing.ts
import { useState, useEffect, useCallback } from 'react';

interface ProcessingStatus {
  stage: 'uploading' | 'processing' | 'storing' | 'downloading' | 'complete' | 'error';
  progress: number;
  statusMessage: string;
  downloadUrl?: string;
  error?: string;
}

export function useVideoProcessing(jobId: string | null) {
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'uploading',
    progress: 0,
    statusMessage: 'Initializing...',
  });

  const checkStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`/api/video/status/${jobId}`);
      const data = await response.json();

      setStatus({
        stage: data.stage,
        progress: data.progress,
        statusMessage: data.message,
        downloadUrl: data.downloadUrl,
        error: data.error,
      });

      // Stop polling if complete or error
      if (data.stage === 'complete' || data.stage === 'error') {
        return true; // Signal to stop polling
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        stage: 'error',
        error: 'Failed to check processing status',
      }));
      return true; // Stop polling on error
    }

    return false; // Continue polling
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 2000);

    // Initial check
    checkStatus();

    return () => clearInterval(interval);
  }, [jobId, checkStatus]);

  return status;
}
```

### Error Handling - Retry Logic

This utility function implements exponential backoff for retrying failed operations:

```typescript
// utils/retry.ts
interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw new Error(
          `Operation failed after ${maxAttempts} attempts: ${lastError.message}`
        );
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Exponential backoff with max delay cap
      delay = Math.min(delay * backoffMultiplier, maxDelay);

      console.log(
        `Retry attempt ${attempt}/${maxAttempts} after ${delay}ms delay`
      );
    }
  }

  throw lastError!;
}

// Usage example
async function processVideo(jobId: string) {
  return retryWithBackoff(
    () => fetch(`/api/video/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    }),
    { maxAttempts: 3, initialDelay: 1000 }
  );
}
```

## Integration Patterns

### Connecting Editor to Backend

The Stoked UI Editor provides several hooks and callbacks for integrating backend processing. The recommended approach is to use the `onExport` callback to intercept the editor's export operation and send the data to your processing API.

First, wrap your editor component with error boundaries and loading states to handle processing lifecycle events. Use React Context or a state management library (Redux, Zustand) to track processing status across your application. This allows you to show a persistent progress indicator even if the user navigates away from the editor page.

Implement a processing queue system for batch operations. If users process multiple videos simultaneously, queue them on your backend and process sequentially to avoid resource exhaustion. Use AWS SQS or a database-backed queue to track pending jobs, and implement worker processes that poll the queue and spawn ECS tasks as resources become available.

For real-time applications, consider implementing WebSocket connections for bidirectional communication. The client can receive progress updates, error notifications, and completion events without polling. AWS API Gateway supports WebSocket APIs that integrate seamlessly with Lambda functions and ECS tasks via EventBridge.

### State Management

Processing state should be stored in a persistent database (DynamoDB, PostgreSQL) to survive server restarts and enable status checks from multiple devices. Create a `VideoProcessingJob` table with columns for `jobId`, `userId`, `status`, `progress`, `createdAt`, `completedAt`, `downloadUrl`, and `errorMessage`.

Update the job status atomically to prevent race conditions when multiple workers or services access the same job. Use optimistic locking with version fields or conditional writes (DynamoDB's ConditionExpression) to ensure consistency. Implement job expiration policies to automatically clean up completed or failed jobs after 7-30 days.

For user-facing status displays, cache frequently accessed job data in Redis or ElastiCache to reduce database load. Set TTLs on cache entries to automatically expire stale data. Implement cache invalidation when job status changes to ensure users always see current information.

### Webhook Integration

Many applications require notifications when video processing completes. Implement a webhook system that sends HTTP POST requests to user-specified URLs when jobs finish. Include job metadata (jobId, status, downloadUrl, processingTime) in the webhook payload. Use HMAC signatures to verify webhook authenticity and prevent spoofing.

For enterprise integrations, support webhook retries with exponential backoff if the recipient endpoint is temporarily unavailable. Store webhook delivery attempts in your database to provide debugging information. Implement webhook logs showing timestamp, response code, and delivery status for each attempt.

Consider offering multiple notification channels: webhooks, email, SMS, or in-app notifications. Allow users to configure notification preferences per project or organization. For high-volume applications, batch notifications to avoid overwhelming recipients with hundreds of individual messages.

## Error Handling

### Common Error Scenarios

Video processing can fail at multiple points in the workflow. Common errors include: network timeouts during upload, insufficient ECS task resources (CPU/memory), invalid video codec parameters, FFmpeg crashes, S3 upload failures, and permission issues. Design your error handling to gracefully recover from transient failures while alerting developers about persistent issues.

Network errors during upload are typically transient and should trigger automatic retries. Implement the retry logic shown in the Code Examples section with exponential backoff. For large files, use resumable uploads (multipart with part tracking) so users don't restart from zero after a failure.

ECS task failures require different handling based on the exit code. Exit code 137 indicates out-of-memory (OOM) kills - increase task memory allocation. Exit code 1 usually indicates FFmpeg errors - parse logs to identify invalid parameters or corrupted input files. Exit codes 255 or 254 suggest infrastructure issues - retry the task or escalate to AWS support.

### Retry Strategies

Implement tiered retry policies based on error type. Transient errors (network timeouts, rate limits, temporary unavailability) should retry immediately with exponential backoff. Persistent errors (invalid input, permission denied, quota exceeded) should fail fast without retries to avoid wasting resources.

Use circuit breaker patterns to prevent cascading failures. If a particular processing operation fails repeatedly (e.g., 5 failures in 60 seconds), temporarily disable that operation and return cached results or degraded functionality. Automatically reset the circuit breaker after a cooldown period (5-10 minutes) and retry.

For critical operations, implement dead letter queues (DLQ) to capture failed jobs for manual review. Monitor DLQ depth and alert when it exceeds thresholds. Analyze DLQ messages to identify systemic issues like misconfigured ECS tasks or S3 permission problems.

### Timeout Handling

Set appropriate timeouts at every layer of your processing pipeline. API Gateway requests should timeout after 29 seconds (AWS limit). ECS task execution should have a maximum timeout (e.g., 15 minutes for complex videos). Long-running tasks should send periodic heartbeats to prove they're making progress.

When a timeout occurs, gracefully terminate the task and clean up partial artifacts. Update job status to 'timeout' with a clear error message. For idempotent operations, clients can safely retry after a timeout without duplicating work.

Implement task monitoring using CloudWatch metrics to track average processing times. Set up alarms when 95th percentile processing time exceeds expected thresholds (e.g., >5 minutes for 30-second videos). Use these metrics to optimize FFmpeg parameters or scale ECS cluster capacity.

### User-Friendly Error Messages

Transform technical errors into actionable user messages. Instead of showing "FFmpeg exited with code 1", display "Your video file appears to be corrupted. Please try uploading a different file." Provide troubleshooting links or support contact information for persistent issues.

Categorize errors by severity: critical (processing failed completely), warning (processing succeeded with reduced quality), informational (processing succeeded slower than expected). Use different UI treatments for each severity level - red alerts for critical, yellow notices for warnings, blue info boxes for informational.

Log detailed error information server-side for debugging while showing simplified messages to users. Include request IDs or job IDs in error messages so support teams can quickly locate relevant logs. Implement error reporting hooks that automatically notify your monitoring system (Sentry, Datadog) when critical errors occur.

## Best Practices

### Cost Optimization

Video processing can incur significant AWS costs if not managed carefully. The primary cost drivers are ECS Fargate compute time (billed per second), S3 storage (billed per GB-month), and data transfer (billed per GB egress). A typical 30-second video processing job costs $0.01-0.05 depending on task size and complexity.

Choose the smallest ECS task size that reliably processes your videos. Start with 0.5 vCPU / 1GB memory for simple cuts and transitions, scale to 2 vCPU / 4GB for complex multi-track compositions. Monitor memory and CPU utilization in CloudWatch and right-size tasks to avoid paying for unused resources.

Implement lifecycle policies on S3 buckets to automatically delete processed videos after a retention period (7-30 days). Transition infrequently accessed videos to cheaper storage classes like S3 Intelligent-Tiering or Glacier. Use S3 Analytics to identify access patterns and optimize storage class transitions.

Enable S3 Transfer Acceleration for faster uploads from distant geographic regions, but only for time-sensitive workflows - it costs 2x standard transfer pricing. Use CloudFront for video delivery to reduce S3 data transfer costs (CloudFront pricing is lower than S3 direct access).

### Performance Considerations

Optimize FFmpeg parameters for your specific use case. Use hardware acceleration when available (NVENC for Nvidia GPUs, VideoToolbox for AWS Graviton instances). For simple cuts without re-encoding, use FFmpeg's stream copy mode (`-c copy`) which processes 50x faster than full re-encoding.

Implement parallel processing for multi-track projects. Process audio and video streams separately then mux together at the end. For long videos (>5 minutes), split into segments and process in parallel ECS tasks, then concatenate results. This reduces total processing time from linear to logarithmic complexity.

Cache frequently used assets in S3 or ECS task ephemeral storage to avoid redundant downloads. For watermarks or intro/outro clips used across many videos, pre-load them in the container image. For source videos, implement a smart caching strategy that keeps recently processed files warm for batch operations.

Monitor processing times and set realistic expectations with users. Display estimated processing time based on video length and complexity before starting. Show live updates every 5-10 seconds during processing. Consider offering a "fast processing" tier with larger ECS tasks and higher costs for users with urgent needs.

### Security and Compliance

Sanitize all user inputs before passing to FFmpeg or other processing tools. Never directly concatenate user-provided strings into shell commands - use parameterized execution or safe libraries. FFmpeg has had security vulnerabilities related to parsing malicious video files, so run tasks in isolated containers with minimal permissions.

Use IAM roles with least-privilege permissions for ECS tasks. Grant only required S3 bucket access, no EC2 or RDS permissions. Enable CloudTrail logging for all S3 and ECS API calls to maintain an audit trail. Implement VPC endpoints for S3 access to keep traffic within AWS network and avoid internet exposure.

For applications handling sensitive content (medical videos, private recordings), enable S3 encryption at rest (SSE-S3 or SSE-KMS) and enforce TLS for data in transit. Consider using AWS PrivateLink to access S3 from ECS tasks without traversing the public internet. Implement job-level access controls so users can only view their own processing jobs.

Comply with data residency requirements by selecting appropriate AWS regions for ECS clusters and S3 buckets. For GDPR compliance, implement data deletion workflows that purge all processing artifacts (source files, intermediate renders, final outputs) within 30 days of user request. Maintain processing logs for the legally required retention period (typically 6-12 months).

### Monitoring and Observability

Implement comprehensive monitoring across all stages of the processing pipeline. Track key metrics: upload success rate, average processing time, S3 upload success rate, download completion rate, and end-to-end latency. Set up CloudWatch dashboards showing these metrics in real-time with historical trends.

Create alarms for critical failures: ECS task failure rate >5%, average processing time >3x baseline, S3 upload errors >2%, job queue depth >100. Configure SNS notifications to alert on-call engineers immediately. Implement automated runbooks that attempt common fixes before escalating to humans.

Use distributed tracing (AWS X-Ray or Datadog APM) to track requests across API Gateway, Lambda, ECS, and S3. Trace individual jobs end-to-end to identify bottlenecks and latency spikes. Correlate traces with logs to debug production issues quickly.

Implement structured logging with consistent fields (jobId, userId, stage, duration, errorCode) across all services. Use CloudWatch Logs Insights to query logs and identify patterns. Set up log-based metrics to track business KPIs like daily active users, total videos processed, and revenue per processed minute.

For further reading on infrastructure as code and serverless deployments, see [SST Documentation](https://docs.sst.dev/). For production-grade video processing pipelines, consult [AWS Media Services](https://aws.amazon.com/media-services/) including MediaConvert for advanced transcoding workflows.
