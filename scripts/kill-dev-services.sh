#!/bin/bash

# Kill development services for THIS project only
# Scoped by project directory to avoid killing other projects' processes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔄 Killing development services for: $PROJECT_DIR"

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

# Function to kill processes matching a pattern, but ONLY if their command line
# also contains this project's directory path
kill_project_processes() {
    local pattern=$1
    local label=$2
    local pids=$(pgrep -f "$pattern" 2>/dev/null)

    if [ -z "$pids" ]; then
        return
    fi

    for pid in $pids; do
        # Check if this process belongs to our project by inspecting its command line
        local cmdline=$(ps -p "$pid" -o args= 2>/dev/null)
        if echo "$cmdline" | grep -q "$PROJECT_DIR"; then
            echo "🔴 Killing $label (pid $pid)"
            kill -TERM "$pid" 2>/dev/null || true
        fi
    done
}

# Kill processes by port (these ports are specific to this project)
kill_port 5199 "Next.js Docs Site"
kill_port 3001 "Video Renderer Service"

# Kill processes by name, scoped to this project's directory
echo "🔄 Killing project-scoped processes..."

kill_project_processes "next dev" "Next.js"
kill_project_processes "nest start" "NestJS"
kill_project_processes "packages/sui-video-renderer" "Video Renderer"
kill_project_processes "pnpm.*dev" "pnpm dev"
kill_project_processes "concurrently" "concurrently"
kill_project_processes "turbo.*dev" "turbo dev"
kill_project_processes "babel.*--watch" "babel watch"
kill_project_processes "tsc.*--watch" "tsc watch"

# Give processes time to fully terminate and release ports
sleep 2

echo "✅ Development services cleanup complete!"
echo "💡 Ports 5199, 3001 should now be available"
