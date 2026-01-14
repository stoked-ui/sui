#!/bin/bash

# Kill all development services to free up ports
echo "🔄 Killing existing development services..."

# Function to kill processes on specific ports with graceful shutdown
kill_port() {
    local port=$1
    local service_name=$2

    # Find processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null)

    if [ ! -z "$pids" ]; then
        echo "🔴 Gracefully stopping $service_name processes on port $port: $pids"

        # Try graceful shutdown first (SIGTERM)
        echo "$pids" | xargs kill -TERM 2>/dev/null || true

        # Wait up to 5 seconds for graceful shutdown
        for i in {1..5}; do
            local remaining=$(lsof -ti:$port 2>/dev/null)
            if [ -z "$remaining" ]; then
                echo "✅ $service_name stopped gracefully"
                return
            fi
            sleep 1
        done

        # Force kill if still running (SIGKILL)
        local remaining=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$remaining" ]; then
            echo "⚠️  Force killing $service_name (graceful shutdown timed out): $remaining"
            echo "$remaining" | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
    else
        echo "✅ Port $port is free ($service_name)"
    fi
}

# Kill processes by port (based on your app configuration)
kill_port 5199 "Next.js Docs Site"
kill_port 3001 "Video Renderer Service"

# Kill processes by name patterns
echo "🔄 Killing processes by name..."

# Kill Next.js processes
pkill -f "next dev" 2>/dev/null || true

# Kill NestJS processes
pkill -f "nest start" 2>/dev/null || true

# Kill specific package dev processes
pkill -f "packages/sui-video-renderer" 2>/dev/null || true

# Kill any pnpm dev processes
pkill -f "pnpm.*dev" 2>/dev/null || true

# Kill concurrently processes
pkill -f "concurrently" 2>/dev/null || true

# Kill Turbo daemon/processes to avoid stale sessions
pkill -f "turbo.*daemon" 2>/dev/null || true
pkill -f "turbod" 2>/dev/null || true
pkill -f "turbo dev" 2>/dev/null || true

# Kill babel watch processes
pkill -f "babel.*--watch" 2>/dev/null || true

# Kill TypeScript watch processes
pkill -f "tsc.*--watch" 2>/dev/null || true

# Give processes time to fully terminate and release ports
sleep 2

echo "✅ Development services cleanup complete!"
echo "💡 Ports 5199, 3001 should now be available"
echo "🧹 All background processes terminated"
