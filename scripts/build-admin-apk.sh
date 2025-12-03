#!/bin/bash
set -e

# Check for --skip-build flag
SKIP_BUILD=false
if [[ "$1" == "--skip-build" ]] || [[ "$1" == "-s" ]]; then
    SKIP_BUILD=true
fi

echo "🏗️  Building Admin App APK..."

# Build Next.js (unless skipped)
if [ "$SKIP_BUILD" = false ]; then
    echo "📦 Building Next.js app..."
    cd admin-app
    npm run build
    cd ..
else
    echo "⏭️  Skipping Next.js build (using existing build)"
    cd admin-app
fi

# Check if android directory exists, if not add Android platform
if [ ! -d "android" ]; then
    echo "📱 Android platform not found. Adding Android platform..."
    npx cap add android
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync

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
echo "📍 Location: admin-app/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on connected device:"
echo "  adb install admin-app/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "💡 Tip: Use --skip-build or -s to skip Next.js build next time"

