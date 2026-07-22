#!/bin/bash
# Build script for Capacitor Android
set -e

echo "=== Building Pelayanan Desa for Capacitor ==="
echo ""

# Step 1: Move API routes out temporarily
echo "[1/5] Preparing for static export..."
if [ -d "src/app/api" ]; then
  mv src/app/api src/api_routes_backup
fi

# Step 2: Build Next.js static export
echo "[2/5] Building Next.js static export..."
rm -rf .next
CAPACITOR_BUILD=true npm run build

# Step 3: Restore API routes
echo "[3/5] Restoring API routes..."
if [ -d "src/api_routes_backup" ]; then
  mv src/api_routes_backup src/app/api
fi

# Step 4: Sync Capacitor
echo "[4/5] Syncing to Android..."
npx cap sync android

# Step 5: Build APK (if gradle available)
echo ""
echo "[5/5] Android project ready!"
echo ""
echo "To build APK:"
echo "  Option 1: Open in Android Studio"
echo "    npx cap open android"
echo ""
echo "  Option 2: Command line"
echo "    cd android && ./gradlew assembleDebug"
echo "    APK: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""

if [ -f "android/gradlew" ]; then
  read -p "Build APK now? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    cd ..
    APK="android/app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK" ]; then
      echo ""
      echo "=== Build Complete ==="
      echo "APK: $APK"
      echo "Size: $(du -h "$APK" | cut -f1)"
    fi
  fi
fi

echo ""
echo "=== Done ==="
