#!/usr/bin/env bash
# Deploy hang-watcher. Records cumulative CPU of the deploy pipeline + newest
# build-dir mtime, compares to the previous run, and prints a verdict.
set -u
ROOT="/opt/worktrees/stoked-ui/stoked-ui-main"
STATE="$ROOT/.stokd/meta/.deploy-watch-state"
NOW=$(date +%s)

# Sum cumulative CPU seconds (from `ps`'s TIME field, MM:SS) of pipeline procs.
# Match the deploy toolchain scoped to this repo so we don't catch unrelated node.
pids_info=$(ps -axo pid,time,command | grep -Ei 'next build|open-next|sst/platform|\.sst/|stoked-ui-main.*(build|deploy)|esbuild' | grep -v grep | grep -v deploy-watch)

cpu_secs=0
nproc=0
while read -r line; do
  [ -z "$line" ] && continue
  t=$(echo "$line" | awk '{print $2}')
  # TIME is like MM:SS.ss or HH:MM:SS
  IFS=':' read -ra parts <<< "$t"
  s=0
  for p in "${parts[@]}"; do s=$(echo "$s * 60 + $p" | bc 2>/dev/null || echo "$s"); done
  cpu_secs=$(echo "$cpu_secs + $s" | bc 2>/dev/null || echo "$cpu_secs")
  nproc=$((nproc+1))
done <<< "$pids_info"
cpu_secs=${cpu_secs%.*}

# Is the top-level next build still alive?
alive=$(ps -axo command | grep -E 'next build --profile' | grep -v grep | wc -l | tr -d ' ')

# Newest mtime across build output dirs
newest=$(find "$ROOT/docs/.next" "$ROOT/.sst" "$ROOT/docs/.open-next" -type f -printf '%T@\n' 2>/dev/null | sort -rn | head -1)
newest=${newest%.*}
[ -z "$newest" ] && newest=0
file_age=$(( NOW - newest ))

prev_cpu=0; prev_ts=0
if [ -f "$STATE" ]; then
  prev_cpu=$(sed -n '1p' "$STATE")
  prev_ts=$(sed -n '2p' "$STATE")
fi
echo "$cpu_secs" > "$STATE"
echo "$NOW" >> "$STATE"

cpu_delta=$(( cpu_secs - prev_cpu ))
gap=$(( NOW - prev_ts ))

echo "=== deploy-watch @ $(date '+%H:%M:%S') ==="
echo "pipeline procs: $nproc | top-level next build alive: $alive"
echo "cumulative CPU: ${cpu_secs}s (delta since last: +${cpu_delta}s over ${gap}s)"
echo "newest build-dir file age: ${file_age}s"
if [ "$alive" -eq 0 ]; then
  echo "VERDICT: next build process is GONE — deploy finished or exited. CHECK THE TERMINAL."
elif [ "$prev_ts" -eq 0 ]; then
  echo "VERDICT: baseline recorded. Need next run to judge progress."
elif [ "$cpu_delta" -le 1 ] && [ "$file_age" -gt 120 ]; then
  echo "VERDICT: LIKELY HUNG — CPU barely moved (+${cpu_delta}s) and no build files written in ${file_age}s."
else
  echo "VERDICT: PROGRESSING — CPU advanced +${cpu_delta}s and/or files written ${file_age}s ago."
fi
