# 📱 Building APKs via Command Line (No Android Studio)

This guide shows how to build APKs using Gradle command line tools, without needing Android Studio.

## Prerequisites

You should already have:
- ✅ Java SDK (JDK 17 or higher recommended)
- ✅ Android SDK Platform Tools
- ✅ Android SDK Build Tools
- ✅ Android SDK (API level 21+)

### Verify Your Setup

```bash
# Check Java version
java -version
# Should be 17 or higher

# Check if Android SDK is set
echo $ANDROID_HOME
# Should show path to Android SDK

# Check if platform-tools are in PATH
adb version
# Should show adb version

# Check Gradle (will be installed automatically, but you can check)
./android/gradlew --version
```

### Set Environment Variables (if not already set)

```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk  # Or your SDK path
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/build-tools/33.0.0  # Adjust version
```

---

## 🛒 Building Customer App APK

### Step 1: Build Next.js App

```bash
# From project root
npm run build

# Verify build output
ls -la .next/
```

### Step 2: Sync Capacitor

```bash
# Sync web assets to native Android project
npm run cap:sync:customer
# Or: npx cap sync

# This creates/updates the android/ folder
```

### Step 3: Navigate to Android Project

```bash
cd android
```

### Step 4: Build Debug APK (for testing)

```bash
# Build debug APK (unsigned, for testing only)
./gradlew assembleDebug

# APK location: app/build/outputs/apk/debug/app-debug.apk
```

### Step 5: Create Keystore (First Time Only)

```bash
# Create keystore for signing release APK
keytool -genkey -v -keystore app/maison-slimani.keystore \
  -alias maison-slimani-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (save this!)
# - Key password (save this!)
# - Your name, organization, etc.

# Move keystore to a safe location (outside android folder)
mv app/maison-slimani.keystore ../maison-slimani.keystore
```

### Step 6: Configure Signing

Create or edit `android/app/build.gradle`:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            storeFile file('../maison-slimani.keystore')  // Path relative to android/app/
            storePassword 'YOUR_KEYSTORE_PASSWORD'        // Or use environment variable
            keyAlias 'maison-slimani-key'
            keyPassword 'YOUR_KEY_PASSWORD'               // Or use environment variable
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**⚠️ Security Note:** Don't commit passwords to git! Use environment variables or `local.properties`:

**Option 1: Environment Variables**
```bash
export KEYSTORE_PASSWORD="your-keystore-password"
export KEY_PASSWORD="your-key-password"
```

Then in `build.gradle`:
```gradle
storePassword System.getenv("KEYSTORE_PASSWORD") ?: ""
keyPassword System.getenv("KEY_PASSWORD") ?: ""
```

**Option 2: local.properties (gitignored)**
Create `android/local.properties`:
```properties
keystore.password=your-keystore-password
key.password=your-key-password
```

Then in `build.gradle`:
```gradle
def keystorePropertiesFile = rootProject.file("local.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

signingConfigs {
    release {
        storePassword keystoreProperties['keystore.password']
        keyPassword keystoreProperties['key.password']
        // ... rest of config
    }
}
```

### Step 7: Build Release APK

```bash
# Build release APK (signed)
./gradlew assembleRelease

# APK location: app/build/outputs/apk/release/app-release.apk
```

### Step 8: Verify APK

```bash
# Check APK info
aapt dump badging app/build/outputs/apk/release/app-release.apk

# Install on connected device
adb install app/build/outputs/apk/release/app-release.apk

# Or transfer to device manually
```

---

## 👨‍💼 Building Admin App APK

### Step 1: Build Admin Next.js App

```bash
# From project root
cd admin-app
npm run build

# Verify build output
ls -la .next/
```

### Step 2: Sync Capacitor

```bash
# Still in admin-app directory
npm run admin:cap:sync
# Or: npx cap sync
```

### Step 3: Navigate to Android Project

```bash
cd android
```

### Step 4: Create Keystore (First Time Only)

```bash
# Create separate keystore for admin app
keytool -genkey -v -keystore app/maison-slimani-admin.keystore \
  -alias maison-slimani-admin-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Move keystore to safe location
mv app/maison-slimani-admin.keystore ../../maison-slimani-admin.keystore
```

### Step 5: Configure Signing

Edit `android/app/build.gradle` with admin keystore details (same process as customer app).

### Step 6: Build Release APK

```bash
# Build release APK
./gradlew assembleRelease

# APK location: app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 Quick Build Scripts

Create these scripts for easier building:

### `scripts/build-customer-apk.sh`

```bash
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

echo "✅ APK built successfully!"
echo "📍 Location: android/app/build/outputs/apk/release/app-release.apk"
```

### `scripts/build-admin-apk.sh`

```bash
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

echo "✅ APK built successfully!"
echo "📍 Location: admin-app/android/app/build/outputs/apk/release/app-release.apk"
```

Make them executable:
```bash
chmod +x scripts/build-customer-apk.sh
chmod +x scripts/build-admin-apk.sh
```

Then run:
```bash
./scripts/build-customer-apk.sh
./scripts/build-admin-apk.sh
```

---

## 🔧 Troubleshooting

### Gradle Not Found

```bash
# Make gradlew executable
chmod +x android/gradlew

# Or use system Gradle (if installed)
gradle assembleRelease
```

### Java Version Issues

```bash
# Check Java version
java -version

# Set JAVA_HOME if needed
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Adjust path
```

### Android SDK Not Found

```bash
# Check ANDROID_HOME
echo $ANDROID_HOME

# Set it if missing
export ANDROID_HOME=$HOME/Android/Sdk

# Verify SDK components
ls $ANDROID_HOME/platforms/
ls $ANDROID_HOME/build-tools/
```

### Build Fails with "SDK location not found"

Create `android/local.properties`:
```properties
sdk.dir=/path/to/Android/Sdk
```

### Keystore Not Found

```bash
# Check keystore path in build.gradle
# Make sure path is relative to android/app/ directory
# Or use absolute path
```

### Out of Memory Error

Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

---

## 📦 Building AAB (Android App Bundle) for Play Store

For Google Play Store, you need AAB instead of APK:

```bash
cd android
./gradlew bundleRelease

# AAB location: app/build/outputs/bundle/release/app-release.aab
```

---

## ✅ Verification Checklist

Before distributing:

- [ ] APK is signed with release keystore
- [ ] APK installs on test device
- [ ] App launches correctly
- [ ] All features work (navigation, API calls, etc.)
- [ ] Icons display correctly
- [ ] App name is correct
- [ ] Version number is correct
- [ ] Keystore is backed up securely

---

## 🔐 Keystore Security

**IMPORTANT:** Keep your keystore safe!

- ✅ Store keystore in secure location (not in project folder)
- ✅ Backup keystore to multiple secure locations
- ✅ Never commit keystore to git
- ✅ Never share keystore passwords
- ✅ Use different keystores for customer and admin apps

If you lose your keystore, you **cannot** update your app on Play Store!

---

## 📚 Additional Resources

- [Gradle Build Documentation](https://developer.android.com/studio/build)
- [Signing Your App](https://developer.android.com/studio/publish/app-signing)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)

---

**Ready to build? Start with the customer app, then build the admin app!** 🚀

