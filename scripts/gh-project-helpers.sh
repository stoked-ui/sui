#!/bin/bash
# GitHub Project #7 Helper Functions

PROJECT_ID="PVT_kwDOClYAc84BMpTz"
STATUS_FIELD_ID="PVTSSF_lADOClYAc84BMpTzzg73oi0"
STATUS_TODO_ID="f75ad846"
STATUS_IN_PROGRESS_ID="47fc9ee4"
STATUS_DONE_ID="98236657"

# Validate we're in the correct worktree
validate_worktree() {
  local project_num=$1
  local current_dir=$(pwd)
  local expected_path="../stoked-ui-project-${project_num}"

  if [[ ! "$current_dir" =~ project-${project_num} ]]; then
    echo "❌ ERROR: Not in project worktree!"
    echo "Current: $current_dir"
    echo "Expected: $expected_path"
    return 1
  fi

  local branch=$(git branch --show-current)
  if [[ "$branch" != "project/${project_num}" ]]; then
    echo "❌ ERROR: Wrong branch!"
    echo "Current: $branch"
    echo "Expected: project/${project_num}"
    return 1
  fi

  echo "✓ Validated worktree for project ${project_num}"
  return 0
}

# Validate main worktree hasn't drifted
validate_main_worktree() {
  local main_worktree=$(git worktree list | grep -v project- | head -1 | awk '{print $1}')
  local main_branch=$(cd "$main_worktree" && git branch --show-current)

  if [[ "$main_branch" != "main" ]]; then
    echo "⚠️  WARNING: Main worktree on branch '$main_branch', not 'main'"
    return 1
  fi

  echo "✓ Main worktree on correct branch"
  return 0
}

# Safe git operation wrapper
safe_git_op() {
  local project_num=$1
  shift
  local cmd="$@"

  validate_worktree "$project_num" || return 1

  echo "Running: $cmd"
  eval "$cmd"
}

# Update item status
update_status() {
  local item_id=$1
  local item_status=$2  # "Todo", "In Progress", or "Done"

  case $item_status in
    "Todo")
      status_option_id="$STATUS_TODO_ID"
      ;;
    "In Progress")
      status_option_id="$STATUS_IN_PROGRESS_ID"
      ;;
    "Done")
      status_option_id="$STATUS_DONE_ID"
      ;;
    *)
      echo "❌ Invalid status: $item_status"
      return 1
      ;;
  esac

  gh api graphql -f query="
    mutation {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: \"$PROJECT_ID\"
          itemId: \"$item_id\"
          fieldId: \"$STATUS_FIELD_ID\"
          value: {
            singleSelectOptionId: \"$status_option_id\"
          }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  " > /dev/null

  echo "✓ Updated $item_id → $item_status"
}

# Export functions
export -f validate_worktree
export -f validate_main_worktree
export -f safe_git_op
export -f update_status
