# Quick Start Deployment Guide

This guide provides quick-start instructions for deploying the Media API using the available helper scripts and Docker Compose.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- FFmpeg installed on your system
- pnpm package manager

## Quick Start (5 minutes)

### 1. Check Dependencies

```bash
./deploy.sh check-deps
```

### 2. Install & Build

```bash
# Install dependencies
./deploy.sh install

# Build project
./deploy.sh build
```

### 3. Start with Docker Compose

```bash
# Start all services (MongoDB, Redis, MinIO, Media API)
./deploy.sh docker-up

# Verify health
./deploy.sh health-check
```

That's it! Your API is now running at `http://localhost:3001`

## Accessing Services

- **Media API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **MongoDB**: localhost:27017 (user: root, password: rootpassword)
- **Redis**: localhost:6379
- **MinIO (S3)**: http://localhost:9001 (credentials: minioadmin/minioadmin)

## Docker Compose Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f media-api

# Stop services
docker-compose down

# Remove all data
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

## Testing

```bash
# Run unit tests
./deploy.sh test unit

# Run tests in watch mode
./deploy.sh test watch

# Run tests with coverage
./deploy.sh test coverage

# Run e2e tests
./deploy.sh test e2e
```

## Building Docker Image

```bash
# Build with default tag
./deploy.sh build-docker

# Build with custom tag
./deploy.sh build-docker my-registry/media-api:1.0.0
```

## Deploying to Kubernetes

```bash
# Deploy to default namespace (stoked)
./deploy.sh deploy-k8s

# Deploy to custom namespace
./deploy.sh deploy-k8s production

# Verify deployment
kubectl get deployments -n stoked
kubectl get pods -n stoked

# View logs
kubectl logs -n stoked -l app=media-api --tail=100

# Port forward for local testing
kubectl port-forward svc/media-api 3001:80 -n stoked
```

## Environment Configuration

### For Local Development

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key variables for local development:
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stoked-media
AWS_S3_ENDPOINT=http://localhost:9000
REDIS_URL=redis://localhost:6379
```

### For Production Deployment

Update environment variables for your production environment:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/stoked-media
AWS_S3_BUCKET=your-production-bucket
AWS_REGION=us-east-1
```

## Cleanup

```bash
# Stop Docker services
./deploy.sh docker-down

# Remove everything (volumes too)
./deploy.sh docker-clean
```

## Troubleshooting

### Port Already in Use

```bash
# If port 3001 is already in use, change it:
PORT=3002 docker-compose up -d
```

### MongoDB Connection Issues

```bash
# Verify MongoDB is running
docker-compose logs mongodb

# Check MongoDB health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### S3/MinIO Issues

```bash
# Access MinIO console at http://localhost:9001
# Create the bucket: stoked-media-uploads
# Credentials: minioadmin / minioadmin
```

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f media-api
docker-compose logs -f mongodb
docker-compose logs -f redis
```

## Manual Startup (Without Docker Compose)

If you prefer to run services manually:

### 1. Start MongoDB

```bash
# Using Homebrew (macOS)
brew services start mongodb-community

# Using Docker
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=rootpassword mongo:latest
```

### 2. Start Redis

```bash
# Using Homebrew (macOS)
brew services start redis

# Using Docker
docker run -d -p 6379:6379 redis:alpine
```

### 3. Start MinIO (Optional S3)

```bash
docker run -d -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address :9001
```

### 4. Start Media API

```bash
# In development with watch mode
pnpm dev

# In production
pnpm build
pnpm start:prod
```

## Next Steps

1. **Read full documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide
2. **Configure for production**: Update environment variables for your production environment
3. **Set up monitoring**: Configure logging, metrics, and health checks
4. **Plan scaling**: Review scaling considerations in main deployment guide
5. **Backup strategy**: Implement MongoDB backup and disaster recovery procedures

## Support

For more detailed information, refer to:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
- [README.md](./README.md) - API documentation
- [MEDIA_CRUD_API.md](./MEDIA_CRUD_API.md) - API endpoints documentation
