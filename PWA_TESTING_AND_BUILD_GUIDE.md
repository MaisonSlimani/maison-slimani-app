# PWA Testing and Build Guide

## 🧪 Testing During Development

### Customer PWA (Same Domain)

#### Option 1: Browser Testing (Easiest)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access PWA mode:**
   - Open browser: `http://localhost:3000`
   - Add `?pwa=true` to URL: `http://localhost:3000?pwa=true`
   - Or manually set cookie: Open DevTools → Application → Cookies → Add `pwa-mode=true`

3. **Test PWA features:**
   - Navigate to `/pwa` routes
   - Test bottom navigation
   - Test install prompt (Chrome DevTools → Application → Manifest)
   - Test service worker (DevTools → Application → Service Workers)

#### Option 2: Mobile Device Testing

1. **Find your local IP:**
   ```bash
   # Linux/Mac
   ip addr show | grep "inet " | grep -v 127.0.0.1
   
   # Or
   hostname -I
   ```

2. **Start dev server with network access:**
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

3. **Access from mobile device:**
   - Connect phone to same WiFi
   - Open browser: `http://YOUR_IP:3000?pwa=true`
   - Test PWA installation on mobile

#### Option 3: Chrome DevTools PWA Testing

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. **Manifest** section:
   - Check manifest is loaded
   - Test "Add to homescreen"
4. **Service Workers** section:
   - Check registration
   - Test offline mode
   - Test cache

### Admin PWA (Separate Domain)

1. **Start admin app:**
   ```bash
   npm run admin:dev
   # Or
   cd admin-app && npm run dev
   ```

2. **Access:**
   - Open browser: `http://localhost:3001`
   - Login with admin credentials
   - Test drawer navigation
   - Test touch interactions

3. **Mobile testing:**
   ```bash
   cd admin-app
   npm run dev -- -H 0.0.0.0
   ```
   - Access from mobile: `http://YOUR_IP:3001`

---

## 📱 Building APKs for App Stores

### Prerequisites

1. **Install Capacitor CLI:**
   ```bash
   npm install -g @capacitor/cli
   ```

2. **Install Android Studio** (for Android builds)
   - Download: https://developer.android.com/studio
   - Install Android SDK
   - Set up Android emulator (optional)

3. **Install Xcode** (for iOS builds - Mac only)
   - Download from App Store
   - Install Command Line Tools

### Customer App APK Build

#### Step 1: Build Next.js App

```bash
# Build the production version
npm run build

# The build output is in .next/
```

#### Step 2: Install Capacitor Dependencies

```bash
# Install Capacitor core and platforms
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Install plugins
npm install @capacitor/push-notifications @capacitor/share @capacitor/camera
```

#### Step 3: Initialize Capacitor (First Time Only)

```bash
# Initialize Capacitor (if not already done)
npx cap init

# When prompted:
# - App name: Maison Slimani
# - App ID: com.maisonslimani.customer
# - Web dir: .next
```

#### Step 4: Sync Capacitor

```bash
# Sync web assets to native projects
npm run cap:sync:customer
# Or
npx cap sync
```

#### Step 5: Build Android APK

```bash
# Open Android Studio
npm run cap:android:customer
# Or
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync to complete
# 2. Go to Build → Generate Signed Bundle / APK
# 3. Select APK
# 4. Create new keystore (first time) or use existing
# 5. Fill in keystore details
# 6. Select release build variant
# 7. Click Finish
# 8. APK will be in: android/app/release/app-release.apk
```

#### Step 6: Build iOS App (Mac Only)

```bash
# Open Xcode
npm run cap:ios:customer
# Or
npx cap open ios

# In Xcode:
# 1. Select your development team in Signing & Capabilities
# 2. Select device or simulator
# 3. Product → Archive
# 4. Distribute App → App Store Connect
# 5. Follow the wizard
```

### Admin App APK Build

#### Step 1: Build Admin App

```bash
cd admin-app
npm install  # First time only
npm run build
```

#### Step 2: Install Capacitor Dependencies

```bash
cd admin-app
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor/push-notifications @capacitor/camera
```

#### Step 3: Initialize Capacitor

```bash
cd admin-app
npx cap init

# When prompted:
# - App name: Maison Slimani Admin
# - App ID: com.maisonslimani.admin
# - Web dir: .next
```

#### Step 4: Sync and Build

```bash
cd admin-app
npm run admin:cap:sync
# Or
npx cap sync

# Open Android Studio
npm run admin:cap:android
# Or
npx cap open android

# Follow same steps as customer app
```

---

## 🔧 Configuration for Production

### Update Capacitor Configs

Before building for production, update the server URLs:

**Customer App** (`capacitor.config.json`):
```json
{
  "server": {
    "url": "https://maisonslimani.ma/pwa",
    "cleartext": false
  }
}
```

**Admin App** (`admin-app/capacitor.config.json`):
```json
{
  "server": {
    "url": "https://admin.maisonslimani.ma",
    "cleartext": false
  }
}
```

### Environment Variables

Make sure production environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET`

---

## 📋 Next Steps Checklist

### Immediate (Development)

- [ ] Test customer PWA in browser with `?pwa=true`
- [ ] Test admin PWA on `localhost:3001`
- [ ] Test on mobile device via local network
- [ ] Verify service workers are registering
- [ ] Test offline functionality
- [ ] Test PWA install prompt

### Before Building APKs

- [ ] Generate PWA icons (all sizes)
  - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
  - Place in `public/icons/` and `admin-app/public/icons/`
- [ ] Create app icons for Android/iOS
  - Android: 1024x1024 (adaptive icon)
  - iOS: 1024x1024 (App Store icon)
- [ ] Update `capacitor.config.json` with production URLs
- [ ] Test production build locally
- [ ] Configure push notification certificates (Firebase/APNs)

### Android Build

- [ ] Install Android Studio
- [ ] Create Android keystore for signing
- [ ] Build release APK
- [ ] Test APK on physical device
- [ ] Create Google Play Console account
- [ ] Prepare store listing (screenshots, description, etc.)
- [ ] Upload APK to Google Play Console

### iOS Build

- [ ] Create Apple Developer account ($99/year)
- [ ] Create App ID in Apple Developer Portal
- [ ] Create provisioning profiles
- [ ] Build and archive in Xcode
- [ ] Upload to App Store Connect
- [ ] Prepare store listing
- [ ] Submit for review

### Post-Build

- [ ] Set up push notifications (Firebase Cloud Messaging for Android, APNs for iOS)
- [ ] Configure deep linking
- [ ] Test on physical devices
- [ ] Monitor crash reports
- [ ] Set up analytics

---

## 🚀 Quick Start Commands

### Development Testing

```bash
# Customer PWA
npm run dev
# Then visit: http://localhost:3000?pwa=true

# Admin PWA
npm run admin:dev
# Then visit: http://localhost:3001
```

### Build for Production

```bash
# Customer PWA
npm run build
npm run cap:sync:customer

# Admin PWA
cd admin-app
npm run build
npm run admin:cap:sync
```

### Open Native Projects

```bash
# Customer - Android
npm run cap:android:customer

# Customer - iOS
npm run cap:ios:customer

# Admin - Android
npm run admin:cap:android

# Admin - iOS
npm run admin:cap:ios
```

---

## 🎨 Generating PWA Icons

You'll need to create icons for both apps. Here's a script to help:

```bash
# Install image tools (if needed)
npm install -g sharp-cli

# Or use online tools:
# - https://realfavicongenerator.net/
# - https://www.pwabuilder.com/imageGenerator
```

Required sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Place them in:
- `public/icons/` (customer PWA)
- `admin-app/public/icons/` (admin PWA)

---

## 📝 Important Notes

1. **Development vs Production:**
   - In dev, Capacitor can point to `http://localhost:3000`
   - In production, must use HTTPS URLs

2. **Service Workers:**
   - Only work on HTTPS (or localhost)
   - Test offline functionality after deployment

3. **App Store Requirements:**
   - Android: Minimum API level 21 (Android 5.0)
   - iOS: Minimum iOS 13.0
   - Both require privacy policies

4. **Testing APKs:**
   - Install APK directly on Android device
   - For iOS, use TestFlight for beta testing

---

## 🐛 Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (or localhost)
- Clear browser cache

### Capacitor Sync Issues
- Delete `android/` and `ios/` folders
- Run `npx cap sync` again

### Build Errors
- Ensure all dependencies are installed
- Check Node.js version (should be 18+)
- Clear `.next` and `node_modules`, reinstall

### APK Installation Fails
- Enable "Install from unknown sources" on Android
- Check APK signature
- Verify minimum SDK version

