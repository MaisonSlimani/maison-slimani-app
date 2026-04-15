#!/bin/bash

# scripts/ignore-build-step.sh
# Returns 1 (build) if CI passed, 0 (ignore) otherwise.

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

# 1. Always build the main/production branch regardless of CI 
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]]; then
  echo "✅ Production branch. Building..."
  exit 1; # 1 = Proceed with build
fi

# 2. For other branches (like revamp), check GitHub Actions status
# We use the GitHub API to see if the latest check_suite succeeded
STATUS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/commits/$VERCEL_GIT_COMMIT_SHA/check-suites" \
  | jq -r '.check_suites[0].conclusion')

if [ "$STATUS" == "success" ]; then
  echo "✅ CI passed for this commit. Building..."
  exit 1; # Build
else
  echo "🛑 CI still running or failed (Status: $STATUS). Skipping build."
  exit 0; # Skip
fi
