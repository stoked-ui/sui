# Deployment Guide: @stoked-ui/media-api

This guide provides comprehensive instructions for deploying the Stoked UI Media API backend service to various environments.

## Table of Contents

- [System Requirements](#system-requirements)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [AWS Deployment](#aws-deployment)
- [Database Setup](#database-setup)
- [S3 Configuration](#s3-configuration)
- [Health Check Endpoints](#health-check-endpoints)
- [Monitoring and Logging](#monitoring-and-logging)
- [Scaling Considerations](#scaling-considerations)
- [Backup and Disaster Recovery](#backup-and-disaster-recovery)

## System Requirements

### Runtime Requirements

- **Node.js**: v18+ (LTS recommended)
- **npm/pnpm**: Latest stable version (pnpm v8+ required)
- **MongoDB**: 4.4+ (for data persistence)
- **ffmpeg**: 4.0+ (for media processing)
- **ffprobe**: 4.0+ (for media analysis)

### System Dependencies

#### macOS
```bash
# Install ffmpeg and ffprobe via Homebrew
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

#### CentOS/RHEL
```bash
sudo yum install -y ffmpeg ffmpeg-devel
```

#### Windows
Download from [ffmpeg official site](https://ffmpeg.org/download.html) and add to PATH.

### Hardware Recommendations

- **CPU**: 2+ cores minimum, 4+ cores recommended
- **RAM**: 2GB minimum, 4GB+ recommended for production
- **Disk**: 10GB+ available space (depends on media storage strategy)
- **Network**: 100Mbps+ for S3 operations

### Development Requirements

- **TypeScript**: 5.4+
- **NestJS**: 10.3.0+
- **Docker**: 20.10+ (optional, for containerized deployment)
- **Kubernetes**: 1.24+ (optional, for K8s deployment)

## Environment Variables

### Complete Environment Configuration

Create a `.env` file in the package root with the following variables:

#### Server Configuration

```env
# Server port (default: 3001)
PORT=3001

# Node environment (development/production)
NODE_ENV=production

# API route prefix
API_PATH_PREFIX=/v1

# SST deployment stage
SST_STAGE=production
```

#### Database Configuration

```env
# MongoDB connection URI
# Format: mongodb://[username:password@]host[:port]/database
MONGODB_URI=mongodb://localhost:27017/stoked-media

# MongoDB retry configuration
# Number of connection retry attempts (default: 3)
MONGODB_RETRY_ATTEMPTS=3

# Delay between retries in milliseconds (default: 1000)
MONGODB_RETRY_DELAY=1000

# Optional: MongoDB authentication
MONGODB_USERNAME=your-username
MONGODB_PASSWORD=your-password

# Optional: MongoDB SSL configuration
MONGODB_SSL=true
MONGODB_SSL_VALIDATE=true
```

#### AWS Configuration

```env
# AWS region for S3 and other services
AWS_REGION=us-east-1

# S3 bucket configuration
AWS_S3_BUCKET=stoked-media-uploads

# AWS S3 access credentials (use IAM roles in production)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Optional: Use IAM role-based authentication (recommended for production)
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/media-api-role

# Optional: S3 endpoint override (for local testing with MinIO)
AWS_S3_ENDPOINT=http://localhost:9000

# S3 region-specific endpoint
AWS_S3_REGION=us-east-1

# Enable S3 path-style addressing
AWS_S3_FORCE_PATH_STYLE=false
```

#### Media Processing Configuration

```env
# FFmpeg/FFprobe configuration
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe

# Media processing timeouts (in milliseconds)
MEDIA_PROCESSING_TIMEOUT=300000

# Thumbnail generation configuration
THUMBNAIL_SIZES=320,640,1280
THUMBNAIL_QUALITY=80

# Maximum file upload size (in bytes)
MAX_FILE_SIZE=1073741824

# Supported media types (comma-separated MIME types)
ALLOWED_MEDIA_TYPES=video/mp4,video/webm,image/jpeg,image/png,image/webp
```

#### Logging Configuration

```env
# Log level (error, warn, log, debug, verbose)
LOG_LEVEL=log

# Enable request logging
LOG_REQUESTS=true

# Enable database query logging (development only)
LOG_DATABASE_QUERIES=false

# Sentry error tracking (optional)
SENTRY_DSN=https://key@sentry.io/project-id

# Enable structured logging (JSON format)
STRUCTURED_LOGS=true
```

#### Authentication Configuration

```env
# API key for internal requests (if applicable)
API_KEY=your-secure-api-key

# JWT configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=24h

# CORS configuration
CORS_ORIGIN=http://localhost:3000,https://example.com

# Allowed request methods
CORS_METHODS=GET,POST,PUT,DELETE,PATCH
```

#### Cache Configuration

```env
# Redis cache configuration (optional)
REDIS_URL=redis://localhost:6379

# Cache TTL in seconds
CACHE_TTL=3600

# Enable response caching
ENABLE_CACHE=true
```

#### Performance Configuration

```env
# Request timeout in milliseconds
REQUEST_TIMEOUT=30000

# Max concurrent uploads
MAX_CONCURRENT_UPLOADS=10

# Enable compression
ENABLE_COMPRESSION=true

# Keep-alive timeout
KEEPALIVE_TIMEOUT=65000
```

### Required Environment Variables Summary

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | No | 3001 | Server port |
| `NODE_ENV` | Yes | - | Environment mode |
| `MONGODB_URI` | Yes | - | Database connection |
| `AWS_REGION` | Yes | - | AWS region |
| `AWS_S3_BUCKET` | Yes | - | S3 bucket name |
| `AWS_ACCESS_KEY_ID` | No* | - | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | No* | - | AWS credentials |

*AWS credentials can be provided via IAM roles in production environments.

## Local Development Setup

### 1. Prerequisites

Ensure all system requirements are installed:

```bash
# Verify Node.js version
node --version  # Should be v18+

# Verify pnpm installation
pnpm --version

# Verify FFmpeg installation
ffmpeg -version
ffprobe -version
```

### 2. Install Dependencies

```bash
# Navigate to the media API package
cd packages/sui-media-api

# Install dependencies
pnpm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with local configuration
nano .env  # or vim/code .env
```

For local development with Docker, see the Docker Compose section below.

### 4. Start MongoDB Locally

```bash
# Option 1: Using Docker (recommended)
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=rootpassword \
  mongo:latest

# Option 2: Using MongoDB Community Edition
# Follow MongoDB documentation for your OS
mongod --version
```

### 5. Run Development Server

```bash
# Start the API in watch mode
pnpm dev

# Or run with hot reload debugging
pnpm start:debug

# Server will start on http://localhost:3001
# Swagger API docs available at http://localhost:3001/api
```

### 6. Verify Installation

```bash
# Health check endpoint
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-21T00:00:00.000Z",
#   "service": "@stoked-ui/media-api",
#   "version": "0.1.0"
# }
```

### 7. Running Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## Docker Deployment

### Building the Docker Image

A production-ready Dockerfile is included in the package. Build with:

```bash
# Build the image
docker build -t stoked-ui/media-api:latest .

# With specific tag and version
docker build -t stoked-ui/media-api:0.1.0 .

# Build without caching (fresh dependencies)
docker build --no-cache -t stoked-ui/media-api:latest .
```

### Dockerfile Details

The Dockerfile includes:

- **Multi-stage build** for optimized image size
- **Production dependencies only** in final image
- **FFmpeg** pre-installed for media processing
- **Health check** endpoint configured
- **Non-root user** for security
- **Optimized node modules** caching

### Running Docker Container

```bash
# Basic run with environment file
docker run -d \
  --name media-api \
  --env-file .env \
  -p 3001:3001 \
  stoked-ui/media-api:latest

# With mounted volumes for logs
docker run -d \
  --name media-api \
  --env-file .env \
  -p 3001:3001 \
  -v /var/log/media-api:/app/logs \
  stoked-ui/media-api:latest

# With resource limits
docker run -d \
  --name media-api \
  --env-file .env \
  -p 3001:3001 \
  --memory=2g \
  --cpus=2 \
  --memory-swap=2g \
  stoked-ui/media-api:latest

# With network isolation
docker run -d \
  --name media-api \
  --env-file .env \
  -p 3001:3001 \
  --network=backend-network \
  stoked-ui/media-api:latest
```

### Docker Compose for Local Development

Create `docker-compose.yml` in the package root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: stoked-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword
      MONGO_INITDB_DATABASE: stoked-media
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s
    networks:
      - stoked-network

  redis:
    image: redis:alpine
    container_name: stoked-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - stoked-network

  minio:
    image: minio/minio:latest
    container_name: stoked-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/minio_data
    command: server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - stoked-network

  media-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: stoked-media-api
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      PORT: 3001
      API_PATH_PREFIX: /v1
      MONGODB_URI: mongodb://root:rootpassword@mongodb:27017/stoked-media?authSource=admin
      AWS_REGION: us-east-1
      AWS_S3_BUCKET: stoked-media-uploads
      AWS_S3_ENDPOINT: http://minio:9000
      AWS_ACCESS_KEY_ID: minioadmin
      AWS_SECRET_ACCESS_KEY: minioadmin
      AWS_S3_FORCE_PATH_STYLE: "true"
      REDIS_URL: redis://redis:6379
      LOG_LEVEL: debug
      LOG_REQUESTS: "true"
      ENABLE_CACHE: "true"
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
      - /app/dist
    command: pnpm dev
    networks:
      - stoked-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local

networks:
  stoked-network:
    driver: bridge
```

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (careful - deletes data)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# Run specific service
docker-compose up -d media-api
```

### Docker Image Optimization

The multi-stage Dockerfile optimizes:

1. **Build Stage**: Compiles TypeScript, installs all dependencies
2. **Production Stage**: Only includes compiled code and production dependencies
3. **Size Reduction**: Typical image size ~800MB

For even smaller images, consider:

```bash
# Using Alpine-based Node
# Update Dockerfile FROM to: node:18-alpine

# Prune unused dependencies
pnpm prune --prod

# Remove dev files from final image
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster v1.24+
- kubectl configured with cluster access
- Container image pushed to registry

### ConfigMap for Environment Variables

Create `k8s/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: media-api-config
  namespace: stoked
spec:
  data:
    NODE_ENV: "production"
    PORT: "3001"
    API_PATH_PREFIX: "/v1"
    LOG_LEVEL: "log"
    LOG_REQUESTS: "true"
    ENABLE_CACHE: "true"
```

### Secret for Sensitive Data

Create `k8s/secret.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: media-api-secrets
  namespace: stoked
type: Opaque
stringData:
  MONGODB_URI: "mongodb+srv://username:password@cluster.mongodb.net/stoked-media?retryWrites=true&w=majority"
  AWS_ACCESS_KEY_ID: "your-access-key"
  AWS_SECRET_ACCESS_KEY: "your-secret-key"
  JWT_SECRET: "your-jwt-secret"
  API_KEY: "your-api-key"
```

### Deployment Manifest

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: media-api
  namespace: stoked
  labels:
    app: media-api
    version: "0.1.0"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: media-api
  template:
    metadata:
      labels:
        app: media-api
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: media-api
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000

      containers:
      - name: media-api
        image: stoked-ui/media-api:0.1.0
        imagePullPolicy: IfNotPresent

        ports:
        - name: http
          containerPort: 3001
          protocol: TCP

        # Environment variables from ConfigMap
        envFrom:
        - configMapRef:
            name: media-api-config
        - secretRef:
            name: media-api-secrets

        # Additional environment variables
        env:
        - name: AWS_REGION
          value: "us-east-1"
        - name: AWS_S3_BUCKET
          value: "stoked-media-uploads"
        - name: MONGODB_RETRY_ATTEMPTS
          value: "3"

        # Resource requests and limits
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"

        # Startup probe (only checks once at start)
        startupProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30

        # Liveness probe (restarts container if unhealthy)
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        # Readiness probe (removes from service if unhealthy)
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 15
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2

        # Volume mounts
        volumeMounts:
        - name: logs
          mountPath: /app/logs

        # Security context for container
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true

      # Volumes
      volumes:
      - name: logs
        emptyDir: {}

      # Pod affinity for distribution
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - media-api
              topologyKey: kubernetes.io/hostname

      # Node selector (optional)
      # nodeSelector:
      #   node-type: api-servers

      # Tolerations (optional)
      # tolerations:
      # - key: "dedicated"
      #   operator: "Equal"
      #   value: "api"
      #   effect: "NoSchedule"
```

### Service Manifest

Create `k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: media-api
  namespace: stoked
  labels:
    app: media-api
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 80
    targetPort: 3001
    protocol: TCP
  selector:
    app: media-api
```

### HorizontalPodAutoscaler

Create `k8s/hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: media-api-hpa
  namespace: stoked
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: media-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 2
        periodSeconds: 15
      selectPolicy: Max
```

### Deploying to Kubernetes

```bash
# Create namespace
kubectl create namespace stoked

# Apply ConfigMap and Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# Check deployment status
kubectl get deployments -n stoked
kubectl get pods -n stoked
kubectl logs -n stoked -l app=media-api --tail=100

# Port forward for local testing
kubectl port-forward svc/media-api 3001:80 -n stoked

# Scale deployment
kubectl scale deployment media-api --replicas=5 -n stoked

# Update image
kubectl set image deployment/media-api \
  media-api=stoked-ui/media-api:0.2.0 \
  -n stoked

# Rollback if needed
kubectl rollout undo deployment/media-api -n stoked
```

## AWS Deployment

### Lambda Deployment

The API includes Lambda support via `src/lambda.bootstrap.ts`:

```bash
# Build for Lambda
pnpm build

# Deploy using SST
sst deploy

# Deploy to specific stage
sst deploy --stage prod
```

### Elastic Container Service (ECS)

```bash
# Create task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster stoked-media \
  --service-name media-api \
  --task-definition media-api:1 \
  --desired-count 3

# Update service
aws ecs update-service \
  --cluster stoked-media \
  --service media-api \
  --force-new-deployment
```

### EC2 Deployment

```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance-ip

# Install dependencies
sudo yum update -y
sudo yum install -y nodejs npm ffmpeg

# Clone and deploy
git clone your-repo
cd packages/sui-media-api
npm install
npm run build
npm start
```

## Database Setup

### MongoDB Atlas (Managed Cloud)

1. Create cluster at https://cloud.mongodb.com
2. Create database user with permissions
3. Add IP whitelist entries
4. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/database`
5. Set `MONGODB_URI` environment variable

### Self-Hosted MongoDB

```bash
# Install MongoDB Community Edition
# Follow https://docs.mongodb.com/manual/installation/

# Start MongoDB service
sudo systemctl start mongod

# Create admin user
mongosh
> use admin
> db.createUser({user: "admin", pwd: "password", roles: ["root"]})

# Create application user
> use stoked-media
> db.createUser({
    user: "mediaapi",
    pwd: "secure-password",
    roles: [{ role: "readWrite", db: "stoked-media" }]
  })

# Connect using URI
mongodb://mediaapi:secure-password@localhost:27017/stoked-media?authSource=stoked-media
```

### MongoDB Backup & Restore

```bash
# Create backup
mongodump --uri="mongodb://user:password@localhost:27017/stoked-media" \
  --out=/backups/mongodb-backup-$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb://user:password@localhost:27017" \
  /backups/mongodb-backup-20240121/

# Backup to archive
mongodump --uri="mongodb://user:password@localhost:27017/stoked-media" \
  --archive=/backups/stoked-media-$(date +%Y%m%d).archive

# Restore from archive
mongorestore --archive=/backups/stoked-media-20240121.archive
```

## S3 Configuration

### AWS S3 Bucket Setup

```bash
# Create bucket
aws s3api create-bucket \
  --bucket stoked-media-uploads \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket stoked-media-uploads \
  --versioning-configuration Status=Enabled

# Configure CORS
aws s3api put-bucket-cors \
  --bucket stoked-media-uploads \
  --cors-configuration file://cors.json
```

### CORS Configuration (cors.json)

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["http://localhost:3000", "https://example.com"],
      "ExposeHeaders": ["x-amz-version-id", "ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Lifecycle Policy for S3

```bash
# Configure lifecycle to clean up old uploads
aws s3api put-bucket-lifecycle-configuration \
  --bucket stoked-media-uploads \
  --lifecycle-configuration file://lifecycle.json
```

### lifecycle.json

```json
{
  "Rules": [
    {
      "Id": "delete-incomplete-uploads",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 7
      }
    },
    {
      "Id": "delete-old-uploads",
      "Status": "Enabled",
      "Prefix": "temp/",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

### IAM Policy for S3 Access

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3MediaAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObjectVersion",
        "s3:HeadObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": [
        "arn:aws:s3:::stoked-media-uploads",
        "arn:aws:s3:::stoked-media-uploads/*"
      ]
    }
  ]
}
```

### Local S3 Testing with MinIO

```bash
# Start MinIO
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address :9001

# Configure .env for local testing
AWS_S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_FORCE_PATH_STYLE=true

# Access MinIO console at http://localhost:9001
```

## Health Check Endpoints

### Health Check Endpoint

**GET /health**

Returns service health status:

```json
{
  "status": "ok",
  "timestamp": "2024-01-21T12:34:56.789Z",
  "service": "@stoked-ui/media-api",
  "version": "0.1.0"
}
```

### Extended Health Check

For production deployments, consider extending the health check to include:

```typescript
// Extended health check response
{
  "status": "ok",
  "timestamp": "2024-01-21T12:34:56.789Z",
  "service": "@stoked-ui/media-api",
  "version": "0.1.0",
  "checks": {
    "database": {
      "status": "connected",
      "latency": 5
    },
    "s3": {
      "status": "connected",
      "latency": 45
    },
    "redis": {
      "status": "connected",
      "latency": 2
    }
  },
  "uptime": 3600,
  "memory": {
    "heapUsed": 52428800,
    "heapTotal": 209715200
  }
}
```

### Health Check Monitoring

Configure monitoring for the health endpoint:

```bash
# Kubernetes health checks (configured in deployment manifest)
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

# Docker health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# CloudWatch monitoring
aws cloudwatch put-metric-alarm \
  --alarm-name media-api-health \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:alerts
```

## Monitoring and Logging

### Structured Logging

The API supports structured JSON logging:

```env
STRUCTURED_LOGS=true
LOG_LEVEL=log
```

Log format:
```json
{
  "timestamp": "2024-01-21T12:34:56.789Z",
  "level": "info",
  "service": "media-api",
  "context": "UploadsService",
  "message": "File uploaded successfully",
  "metadata": {
    "fileId": "abc123",
    "size": 1048576,
    "duration": 234
  }
}
```

### Logging Aggregation

#### CloudWatch Logs

```bash
# Create log group
aws logs create-log-group --log-group-name /aws/ecs/media-api

# Stream logs
aws logs tail /aws/ecs/media-api --follow
```

#### ELK Stack Integration

```javascript
// Configure Winston with Elasticsearch
import { ElasticsearchTransport } from 'winston-elasticsearch';

new ElasticsearchTransport({
  level: 'info',
  clientOpts: {
    node: 'https://elasticsearch:9200'
  },
  index: 'media-api-logs',
});
```

### Prometheus Metrics

Export Prometheus metrics endpoint:

```typescript
// src/metrics/metrics.controller.ts
@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics() {
    return register.metrics();
  }
}
```

### Application Performance Monitoring (APM)

Configure DataDog or New Relic:

```env
# DataDog
DD_AGENT_HOST=localhost
DD_AGENT_PORT=8126
DD_ENV=production
DD_SERVICE=media-api
DD_VERSION=0.1.0

# New Relic
NEW_RELIC_APP_NAME=media-api
NEW_RELIC_LICENSE_KEY=your-license-key
```

## Scaling Considerations

### Horizontal Scaling

1. **Stateless Design**: The API is stateless and can scale horizontally
2. **Session Management**: Use Redis for distributed sessions if needed
3. **Database Connection Pooling**: Configure MongoDB connection pool
4. **Load Balancing**: Use AWS ALB or NGINX for load distribution

### Connection Pool Configuration

```env
# MongoDB connection pooling
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2

# Redis connection pooling
REDIS_MAX_RETRIES=3
REDIS_ENABLE_RECONNECT=true
```

### Vertical Scaling

Adjust resource limits based on load:

```env
# Node.js heap size
NODE_OPTIONS=--max-old-space-size=2048

# Request timeout
REQUEST_TIMEOUT=30000

# Max concurrent uploads
MAX_CONCURRENT_UPLOADS=10
```

### Auto-Scaling Configuration

#### Kubernetes HPA Targets

```yaml
# CPU-based scaling
- type: Resource
  resource:
    name: cpu
    target:
      type: Utilization
      averageUtilization: 70

# Memory-based scaling
- type: Resource
  resource:
    name: memory
    target:
      type: Utilization
      averageUtilization: 80
```

#### AWS AutoScaling Groups

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name media-api-asg \
  --launch-configuration media-api-lc \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --health-check-type ELB
```

### Caching Strategy

Enable caching to reduce database load:

```env
ENABLE_CACHE=true
CACHE_TTL=3600
REDIS_URL=redis://localhost:6379

# Cache invalidation strategies
CACHE_INVALIDATION=time-based  # or event-based
```

## Backup and Disaster Recovery

### Backup Strategy

#### MongoDB Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/mongodb/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

mongodump \
  --uri="mongodb://user:password@localhost:27017/stoked-media" \
  --out=$BACKUP_DIR

# Upload to S3
aws s3 cp $BACKUP_DIR s3://backups/mongodb-$(date +%Y%m%d) --recursive

# Delete local backup after 7 days
find /backups/mongodb -type d -mtime +7 -exec rm -rf {} \;
```

#### S3 Backup

```bash
# Enable S3 versioning (already configured)
aws s3api put-bucket-versioning \
  --bucket stoked-media-uploads \
  --versioning-configuration Status=Enabled

# Configure cross-region replication
aws s3api put-bucket-replication \
  --bucket stoked-media-uploads \
  --replication-configuration file://replication.json
```

### Disaster Recovery Plan

1. **RPO (Recovery Point Objective)**: 4 hours
2. **RTO (Recovery Time Objective)**: 1 hour
3. **Failover**: Automated via Kubernetes or load balancer
4. **Data Restore**: From MongoDB backups and S3 versioning

### Recovery Procedures

#### Database Recovery

```bash
# List available backups
aws s3 ls s3://backups/mongodb/

# Download backup
aws s3 sync s3://backups/mongodb/20240121 ./backup/

# Restore to new database
mongorestore \
  --uri="mongodb://user:password@localhost:27017" \
  ./backup/

# Verify restore
mongosh --eval "db.getMongo().getDBNames()"
```

#### Application Recovery

```bash
# Kubernetes rollback
kubectl rollout undo deployment/media-api -n stoked

# Check rollout history
kubectl rollout history deployment/media-api -n stoked

# Rollback to specific revision
kubectl rollout undo deployment/media-api --to-revision=3 -n stoked
```

### Monitoring Backups

```bash
# Verify backup success
aws s3 ls s3://backups/mongodb/ --recursive | tail -20

# CloudWatch alarm for backup failures
aws cloudwatch put-metric-alarm \
  --alarm-name backup-failure \
  --metric-name BackupFailures \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold
```

## Troubleshooting

### Common Issues

**Issue**: Connection timeout to MongoDB
```bash
# Check MongoDB is running
ps aux | grep mongod

# Verify connection string
echo "mongodb://user:password@localhost:27017/stoked-media"

# Test connection
mongosh "mongodb://user:password@localhost:27017/stoked-media"
```

**Issue**: S3 permission errors
```bash
# Verify IAM credentials
aws s3 ls

# Check bucket exists
aws s3 ls | grep stoked-media

# Test S3 upload
aws s3 cp test.txt s3://stoked-media-uploads/
```

**Issue**: FFmpeg not found
```bash
# Verify installation
which ffmpeg
which ffprobe

# Check PATH
echo $PATH

# Verify paths in .env
cat .env | grep FFMPEG
```

**Issue**: Port already in use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Use different port
PORT=3002 pnpm dev
```

### Debug Mode

```bash
# Enable verbose logging
LOG_LEVEL=debug pnpm dev

# Debug with Node inspector
pnpm start:debug

# Connect Chrome DevTools to chrome://inspect
```

## Support and Documentation

- **API Documentation**: http://localhost:3001/api (when running)
- **NestJS Docs**: https://docs.nestjs.com
- **MongoDB Docs**: https://docs.mongodb.com
- **AWS S3 Docs**: https://aws.amazon.com/s3/

## Version History

- **0.1.0** (2024-01-21): Initial deployment guide
