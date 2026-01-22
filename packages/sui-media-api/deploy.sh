#!/bin/bash

# Deployment Helper Script for @stoked-ui/media-api
# Provides utilities for building, testing, and deploying the Media API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check dependencies
check_dependencies() {
    print_header "Checking Dependencies"

    local missing_deps=0

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        missing_deps=$((missing_deps + 1))
    else
        NODE_VERSION=$(node -v)
        print_success "Node.js $NODE_VERSION"
    fi

    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        missing_deps=$((missing_deps + 1))
    else
        PNPM_VERSION=$(pnpm -v)
        print_success "pnpm $PNPM_VERSION"
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        missing_deps=$((missing_deps + 1))
    else
        DOCKER_VERSION=$(docker --version)
        print_success "$DOCKER_VERSION"
    fi

    # Check FFmpeg
    if ! command -v ffmpeg &> /dev/null; then
        print_error "FFmpeg is not installed"
        missing_deps=$((missing_deps + 1))
    else
        FFMPEG_VERSION=$(ffmpeg -version | head -n1)
        print_success "$FFMPEG_VERSION"
    fi

    if [ $missing_deps -gt 0 ]; then
        print_error "Missing $missing_deps dependencies. Please install them before proceeding."
        exit 1
    fi
}

# Build Docker image
build_docker() {
    print_header "Building Docker Image"

    local tag="${1:-stoked-ui/media-api:latest}"

    print_info "Building Docker image: $tag"
    docker build -t "$tag" "$SCRIPT_DIR"

    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully: $tag"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Run Docker container
run_docker() {
    print_header "Starting Docker Container"

    print_info "Starting containers with Docker Compose..."
    docker-compose -f "$SCRIPT_DIR/docker-compose.yml" up -d

    print_info "Waiting for services to be healthy..."
    sleep 10

    # Check health
    HEALTH=$(curl -s http://localhost:3001/health | grep -c "ok" || true)
    if [ $HEALTH -gt 0 ]; then
        print_success "Media API is healthy!"
        print_info "API available at: http://localhost:3001"
        print_info "MongoDB available at: localhost:27017"
        print_info "Redis available at: localhost:6379"
        print_info "MinIO available at: http://localhost:9000 (credentials: minioadmin/minioadmin)"
    else
        print_error "Media API health check failed"
        docker-compose -f "$SCRIPT_DIR/docker-compose.yml" logs media-api
        exit 1
    fi
}

# Stop Docker containers
stop_docker() {
    print_header "Stopping Docker Containers"

    print_info "Stopping containers..."
    docker-compose -f "$SCRIPT_DIR/docker-compose.yml" down

    print_success "Containers stopped"
}

# Remove Docker containers and volumes
clean_docker() {
    print_header "Cleaning Docker Containers and Volumes"

    print_info "Removing containers and volumes..."
    docker-compose -f "$SCRIPT_DIR/docker-compose.yml" down -v

    print_success "Cleanup complete"
}

# Install dependencies
install_deps() {
    print_header "Installing Dependencies"

    cd "$SCRIPT_DIR"
    print_info "Running pnpm install..."
    pnpm install

    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Build project
build_project() {
    print_header "Building Project"

    cd "$SCRIPT_DIR"
    print_info "Running pnpm build..."
    pnpm build

    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Failed to build project"
        exit 1
    fi
}

# Run tests
run_tests() {
    print_header "Running Tests"

    cd "$SCRIPT_DIR"

    case "${1:-unit}" in
        unit)
            print_info "Running unit tests..."
            pnpm test
            ;;
        watch)
            print_info "Running tests in watch mode..."
            pnpm test:watch
            ;;
        coverage)
            print_info "Running tests with coverage..."
            pnpm test:cov
            ;;
        e2e)
            print_info "Running e2e tests..."
            pnpm test:e2e
            ;;
        *)
            print_error "Unknown test type: $1"
            exit 1
            ;;
    esac
}

# Deploy to Kubernetes
deploy_k8s() {
    print_header "Deploying to Kubernetes"

    local namespace="${1:-stoked}"

    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi

    print_info "Creating namespace: $namespace"
    kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -

    print_info "Applying ConfigMap..."
    kubectl apply -f "$SCRIPT_DIR/k8s/configmap.yaml"

    print_info "Applying Secret..."
    kubectl apply -f "$SCRIPT_DIR/k8s/secret.yaml"

    print_info "Applying ServiceAccount..."
    kubectl apply -f "$SCRIPT_DIR/k8s/serviceaccount.yaml"

    print_info "Applying Deployment..."
    kubectl apply -f "$SCRIPT_DIR/k8s/deployment.yaml"

    print_info "Applying Service..."
    kubectl apply -f "$SCRIPT_DIR/k8s/service.yaml"

    print_info "Applying HPA..."
    kubectl apply -f "$SCRIPT_DIR/k8s/hpa.yaml"

    print_info "Applying Ingress..."
    kubectl apply -f "$SCRIPT_DIR/k8s/ingress.yaml"

    print_success "Kubernetes deployment complete"
    print_info "Check deployment status with: kubectl get deployments -n $namespace"
}

# Health check
health_check() {
    print_header "Health Check"

    print_info "Checking API health..."
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)

    if [ "$RESPONSE" = "200" ]; then
        print_success "API is healthy (HTTP $RESPONSE)"
        curl -s http://localhost:3001/health | jq '.'
    else
        print_error "API health check failed (HTTP $RESPONSE)"
        exit 1
    fi
}

# Show usage
show_usage() {
    cat << EOF
${BLUE}@stoked-ui/media-api Deployment Helper${NC}

Usage: $0 <command> [options]

Commands:
    check-deps          Check if all dependencies are installed
    install             Install project dependencies
    build               Build the project
    test [type]         Run tests (unit|watch|coverage|e2e)
    build-docker [tag]  Build Docker image
    docker-up           Start Docker Compose services
    docker-down         Stop Docker Compose services
    docker-clean        Remove Docker containers and volumes
    deploy-k8s [ns]     Deploy to Kubernetes (namespace: default=stoked)
    health-check        Check API health status
    help                Show this help message

Examples:
    $0 check-deps
    $0 install
    $0 build
    $0 test unit
    $0 build-docker stoked-ui/media-api:0.1.0
    $0 docker-up
    $0 docker-down
    $0 deploy-k8s production
    $0 health-check

EOF
}

# Main
case "${1:-help}" in
    check-deps)
        check_dependencies
        ;;
    install)
        install_deps
        ;;
    build)
        build_project
        ;;
    test)
        run_tests "${2:-unit}"
        ;;
    build-docker)
        build_docker "${2:-stoked-ui/media-api:latest}"
        ;;
    docker-up)
        run_docker
        ;;
    docker-down)
        stop_docker
        ;;
    docker-clean)
        clean_docker
        ;;
    deploy-k8s)
        deploy_k8s "${2:-stoked}"
        ;;
    health-check)
        health_check
        ;;
    help)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
