#!/bin/bash
set -e

# Check for --skip-build flag
SKIP_BUILD=false
if [[ "$1" == "--skip-build" ]] || [[ "$1" == "-s" ]]; then
    SKIP_BUILD=true
fi

echo "🏗️  Building Customer App APK..."

# Build Next.js (unless skipped)
if [ "$SKIP_BUILD" = false ]; then
    echo "📦 Building Next.js app..."
    npm run build
else
    echo "⏭️  Skipping Next.js build (using existing build)"
fi

# Check if android directory exists, if not add Android platform
if [ ! -d "android" ]; then
    echo "📱 Android platform not found. Adding Android platform..."
    npx cap add android
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npm run cap:sync:customer

# Build APK
echo "🔨 Building Android APK..."
cd android

# Make gradlew executable if it isn't
if [ -f "gradlew" ]; then
    chmod +x gradlew
fi

./gradlew assembleDebug

echo ""
echo "✅ APK built successfully!"
echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on connected device:"
echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "💡 Tip: Use --skip-build or -s to skip Next.js build next time"

