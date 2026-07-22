Struktur Capacitor
Arsitektur
┌─────────────────────────────────────────┐
│  WEB (Development)                      │
│  Next.js full-stack on :3000            │
│  (SSR + API routes + proxy)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  MOBILE (Capacitor Android)             │
│  Static HTML/CSS/JS in Android WebView  │
│  + Express backend on :3001             │
│  Connects via http://10.0.2.2:3001      │
└─────────────────────────────────────────┘
Cara Build Android APK
1. Jalankan backend server:
npm run server
# Backend berjalan di http://0.0.0.0:3001
2. Build APK:
npm run cap:build
# Atau manual:
npm run cap:sync
cd android && ./gradlew assembleDebug
3. APK location:
android/app/build/outputs/apk/debug/app-debug.apk
Files Penting
- server/index.ts - Standalone Express backend
- src/components/CapacitorProvider.tsx - API URL rewriting for native
- capacitor.config.json - Capacitor configuration
- build-android.sh - Automated build script
Konfigurasi Server
Ubah IP backend di src/components/CapacitorProvider.tsx:
// Android emulator: http://10.0.2.2:3001
// Real device: http://192.168.x.x:3001
const DEFAULT_API_BASE = "http://10.0.2.2:3001";
NPM Scripts
Script	Description
npm run server	Jalankan Express backend
npm run cap:build	Build static + sync Capacitor
npm run cap:sync	Sync web assets ke Android
npm run cap:open	Buka di Android Studio
▣  Build · MiMo V2.5 Free · 12m 50s
