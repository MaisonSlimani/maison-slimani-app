#!/bin/bash

# scripts/ignore-build-step.sh
# 0 = Skip Build (Ignore)
# 1 = Proceed with Build

# If the build was triggered by our GitHub Action (03-production-deployment), 
# it will have a specific environment variable or we can detect it.
# However, the EASIEST way to stop the "Auto-Push" build is:

if [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"optimized the yml files"* || "$VERCEL_GIT_COMMIT_MESSAGE" == "[skip vercel]" ]]; then
  echo "🛑 Auto-push detected. Skipping Vercel's automatic build."
  exit 0;
fi

# PROFESSIONAL WAY:
# If you are NOT on the main branch, and the build was NOT triggered by the Vercel CLI 
# (which our GitHub Action uses), skip it.

if [[ "$VERCEL_GIT_COMMIT_REF" != "main" ]]; then
  # On feature branches (like revamp), only build if triggered by our script
  echo "🛑 Feature branch auto-build blocked. Waiting for GitHub Action..."
  exit 0;
fi

echo "✅ Proceeding with build."
exit 1
