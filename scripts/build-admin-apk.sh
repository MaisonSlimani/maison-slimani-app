#!/bin/bash
set -e

echo "🏗️  Building Admin App APK..."

# Build Next.js
echo "📦 Building Next.js app..."
cd admin-app
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync

# Build APK
echo "🔨 Building Android APK..."
cd android
./gradlew assembleRelease

echo ""
echo "✅ APK built successfully!"
echo "📍 Location: admin-app/android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "To install on connected device:"
echo "  adb install admin-app/android/app/build/outputs/apk/release/app-release.apk"

