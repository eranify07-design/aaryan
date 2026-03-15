# Dastak Mobile — Android Studio Build Guide

## What's Included

This folder contains the complete Android native project generated from the Dastak Mobile Expo app.  
The JavaScript bundle (`app/src/main/assets/index.android.bundle`) is **already pre-built**, so you won't need to run Metro during the build.

---

## Requirements

| Tool | Version |
|------|---------|
| Android Studio | Hedgehog (2023.1.1) or newer |
| Android SDK | API 34 (Android 14) |
| JDK | 17 (bundled with Android Studio) |
| Node.js | 18 or newer |
| pnpm | 9 or newer (`npm install -g pnpm`) |

> **Why Node.js?** The React Native Gradle Plugin calls `node` to resolve library paths during the build configuration phase. Even with a pre-built JS bundle, Gradle still needs Node.js to locate the native React Native libraries.

---

## Build Steps

### 1. Extract the ZIP
Extract the ZIP so you have a folder named `dastak-mobile/` (or similar).

### 2. Install JavaScript dependencies
Open a terminal in the **root project folder** (where `package.json` lives) and run:

```bash
npm install
# or, if you use pnpm:
pnpm install
```

This downloads React Native and Expo native libraries referenced by the Gradle build.

### 3. Open Android project in Android Studio
- Launch Android Studio
- Choose **File → Open**
- Navigate to and select the **`android/`** folder inside the project
- Wait for Gradle sync to complete (first time takes 5–10 minutes while downloading dependencies)

### 4. Build the APK

**Option A — From Android Studio UI:**
- Go to **Build → Generate Signed Bundle / APK → APK**
- Create or select a keystore (use debug keystore for testing: `~/.android/debug.keystore`, password: `android`)
- Choose **release** variant and click Finish

**Option B — From terminal (faster):**
```bash
# From the android/ folder:
./gradlew assembleRelease

# The APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

**For a quick debug APK (no signing needed):**
```bash
./gradlew assembleDebug
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Pre-built JS Bundle

The file `app/src/main/assets/index.android.bundle` is already compiled (Hermes bytecode).  
Gradle will detect it and skip re-bundling for release builds.

If you make JS code changes, rebuild the bundle before building the APK:
```bash
# From project root:
npx expo export --platform android --output-dir /tmp/expo-export
cp /tmp/expo-export/_expo/static/js/android/*.hbc android/app/src/main/assets/index.android.bundle
```

---

## Firebase Configuration

The app connects to Firebase project `dev-aaryan-s-billing-app`.  
Firebase is configured via `lib/firebase.ts` (web SDK, no `google-services.json` required for basic Auth/Firestore/Storage).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `node: command not found` during Gradle sync | Install Node.js 18+ and ensure it's on your PATH |
| `SDK location not found` | Set `ANDROID_HOME` env var or create `android/local.properties` with `sdk.dir=/path/to/Android/Sdk` |
| Gradle sync fails on first run | Check internet connection — Gradle downloads ~200MB of dependencies |
| Build fails with "Kotlin version" error | Update Kotlin plugin in Android Studio |

---

## App Features
- Firebase Authentication (email/password)
- Multi-shop management
- Product inventory (add, edit, delete)
- Bill generation with cart
- Sales history with profit tracking
- Dark/light theme support
