#!/bin/bash
set -e

echo "🏗️  Building Customer App APK..."

# Build Next.js
echo "📦 Building Next.js app..."
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npm run cap:sync:customer

# Build APK
echo "🔨 Building Android APK..."
cd android
./gradlew assembleRelease

echo ""
echo "✅ APK built successfully!"
echo "📍 Location: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "To install on connected device:"
echo "  adb install android/app/build/outputs/apk/release/app-release.apk"

