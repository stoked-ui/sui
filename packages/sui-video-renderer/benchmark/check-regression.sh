#!/usr/bin/env bash

# Benchmark Regression Detection Script
# Compares current benchmark results against a baseline and flags regressions > 10%

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASELINE_FILE="${SCRIPT_DIR}/baseline.json"
TEMP_RESULTS="${SCRIPT_DIR}/current_results.txt"
REGRESSION_THRESHOLD=10  # Percentage threshold for flagging regressions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Benchmark Regression Detection"
echo "========================================="
echo ""

# Navigate to compositor directory
cd "${SCRIPT_DIR}/../compositor"

echo "Running benchmarks..."
echo ""

# Run cargo bench with bencher output format
cargo bench --bench frame_composition -- --output-format bencher > "${TEMP_RESULTS}" 2>&1 || {
    echo -e "${RED}Error: Benchmark execution failed${NC}"
    cat "${TEMP_RESULTS}"
    exit 1
}

# Parse current results
declare -A current_results
while IFS= read -r line; do
    # Bencher format: test name ... bench: X ns/iter (+/- Y)
    if [[ $line =~ test\ (.+)\ \.\.\.\ bench:\ +([0-9,]+)\ ns/iter ]]; then
        test_name="${BASH_REMATCH[1]}"
        # Remove commas from number
        ns_value="${BASH_REMATCH[2]//,/}"
        current_results["$test_name"]="$ns_value"
    fi
done < "${TEMP_RESULTS}"

echo "Found ${#current_results[@]} benchmark results"
echo ""

# Check if baseline exists
if [[ ! -f "$BASELINE_FILE" ]]; then
    echo -e "${YELLOW}No baseline file found. Creating new baseline...${NC}"

    # Create baseline JSON
    echo "{" > "$BASELINE_FILE"
    first=true
    for test_name in "${!current_results[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$BASELINE_FILE"
        fi
        echo "  \"$test_name\": ${current_results[$test_name]}" >> "$BASELINE_FILE"
    done
    echo "" >> "$BASELINE_FILE"
    echo "}" >> "$BASELINE_FILE"

    echo -e "${GREEN}Baseline created successfully at: $BASELINE_FILE${NC}"
    rm -f "${TEMP_RESULTS}"
    exit 0
fi

# Load baseline
echo "Loading baseline from: $BASELINE_FILE"
declare -A baseline_results

while IFS=: read -r key value; do
    # Remove quotes, spaces, and commas
    clean_key=$(echo "$key" | tr -d ' "')
    clean_value=$(echo "$value" | tr -d ' ,')
    if [[ -n "$clean_key" && "$clean_value" =~ ^[0-9]+$ ]]; then
        baseline_results["$clean_key"]="$clean_value"
    fi
done < <(grep -o '"[^"]*":[^,}]*' "$BASELINE_FILE")

echo "Loaded ${#baseline_results[@]} baseline benchmarks"
echo ""

# Compare results
echo "========================================="
echo "Regression Analysis"
echo "========================================="
echo ""

has_regression=false
improvement_count=0
regression_count=0
stable_count=0

for test_name in "${!current_results[@]}"; do
    current_ns="${current_results[$test_name]}"
    baseline_ns="${baseline_results[$test_name]:-0}"

    if [[ "$baseline_ns" -eq 0 ]]; then
        echo -e "${YELLOW}NEW: $test_name${NC}"
        echo "  Current: ${current_ns} ns/iter"
        continue
    fi

    # Calculate percentage change
    diff=$((current_ns - baseline_ns))
    percent_change=$(awk "BEGIN {printf \"%.2f\", ($diff / $baseline_ns) * 100}")

    if (( $(echo "$percent_change > $REGRESSION_THRESHOLD" | bc -l) )); then
        echo -e "${RED}REGRESSION: $test_name${NC}"
        echo "  Baseline: ${baseline_ns} ns/iter"
        echo "  Current:  ${current_ns} ns/iter"
        echo "  Change:   ${percent_change}% slower"
        has_regression=true
        ((regression_count++))
    elif (( $(echo "$percent_change < -$REGRESSION_THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}IMPROVEMENT: $test_name${NC}"
        echo "  Baseline: ${baseline_ns} ns/iter"
        echo "  Current:  ${current_ns} ns/iter"
        echo "  Change:   ${percent_change}% faster"
        ((improvement_count++))
    else
        echo -e "STABLE: $test_name (${percent_change}% change)"
        ((stable_count++))
    fi
    echo ""
done

echo "========================================="
echo "Summary"
echo "========================================="
echo "Improvements: $improvement_count"
echo "Stable:       $stable_count"
echo "Regressions:  $regression_count"
echo ""

# Clean up temp file
rm -f "${TEMP_RESULTS}"

if [ "$has_regression" = true ]; then
    echo -e "${RED}WARNING: Performance regressions detected!${NC}"
    echo "Review the changes before updating the baseline."
    exit 1
else
    echo -e "${GREEN}No regressions detected.${NC}"

    # Offer to update baseline
    read -p "Update baseline with current results? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create new baseline JSON
        echo "{" > "$BASELINE_FILE"
        first=true
        for test_name in "${!current_results[@]}"; do
            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> "$BASELINE_FILE"
            fi
            echo "  \"$test_name\": ${current_results[$test_name]}" >> "$BASELINE_FILE"
        done
        echo "" >> "$BASELINE_FILE"
        echo "}" >> "$BASELINE_FILE"

        echo -e "${GREEN}Baseline updated successfully.${NC}"
    else
        echo "Baseline not updated."
    fi
    exit 0
fi
