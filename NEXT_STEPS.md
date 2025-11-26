# 🎯 Next Steps - PWA Development & Deployment

## ✅ What's Done

- ✅ Customer PWA structure (`app/(pwa)/`)
- ✅ Admin PWA structure (`admin-app/`)
- ✅ PWA layouts with native app UI
- ✅ Service workers configured
- ✅ Capacitor configs ready
- ✅ Build scripts added

## 🧪 Immediate Testing (Do This First!)

### 1. Test Customer PWA Locally

```bash
# Start dev server
npm run dev

# Open browser
# Option A: Add ?pwa=true to URL
http://localhost:3000?pwa=true

# Option B: Set cookie manually
# Open DevTools → Application → Cookies → Add: pwa-mode=true
```

**What to test:**
- [ ] Bottom navigation appears
- [ ] Routes work (`/pwa`, `/pwa/boutique`, `/pwa/panier`)
- [ ] Install prompt shows (Chrome: DevTools → Application → Manifest)
- [ ] Service worker registers (DevTools → Application → Service Workers)

### 2. Test Admin PWA Locally

```bash
# First time: Install dependencies
cd admin-app
npm install

# Start dev server
npm run admin:dev
# Or from root: npm run admin:dev

# Open browser
http://localhost:3001
```

**What to test:**
- [ ] Login works
- [ ] Drawer navigation works
- [ ] Dashboard loads
- [ ] Orders page works
- [ ] Products page works

### 3. Test on Mobile Device

```bash
# Find your local IP
hostname -I  # Linux
ipconfig getifaddr en0  # Mac

# Start dev with network access
npm run dev -- -H 0.0.0.0

# On mobile (same WiFi):
# Customer: http://YOUR_IP:3000?pwa=true
# Admin: http://YOUR_IP:3001
```

**What to test:**
- [ ] Touch interactions work
- [ ] Bottom navigation is accessible
- [ ] Install prompt appears
- [ ] App installs to home screen

---

## 📦 Building APKs - Step by Step

### Prerequisites Installation

#### 1. Install Capacitor CLI

```bash
npm install -g @capacitor/cli
```

#### 2. Install Capacitor Dependencies

**For Customer App:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor/push-notifications @capacitor/share @capacitor/camera
```

**For Admin App:**
```bash
cd admin-app
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor/push-notifications @capacitor/camera
```

#### 3. Install Android Studio

- Download: https://developer.android.com/studio
- Install Android SDK (API level 21+)
- Set up Android emulator (optional, for testing)

#### 4. Install Xcode (iOS - Mac Only)

- Download from Mac App Store
- Install Command Line Tools: `xcode-select --install`

---

### Building Customer App APK

#### Step 1: Build Production Version

```bash
# Build Next.js app
npm run build

# Verify build succeeded
ls -la .next/
```

#### Step 2: Initialize Capacitor (First Time Only)

```bash
# If capacitor.config.json doesn't exist or needs update
npx cap init

# When prompted:
# - App name: Maison Slimani
# - App ID: com.maisonslimani.customer
# - Web dir: .next
```

#### Step 3: Sync Capacitor

```bash
# Sync web assets to native projects
npm run cap:sync:customer
# Or: npx cap sync
```

This creates `android/` and `ios/` folders.

#### Step 4: Open Android Studio

```bash
npm run cap:android:customer
# Or: npx cap open android
```

#### Step 5: Build Release APK

**In Android Studio:**

1. Wait for Gradle sync to complete
2. Go to **Build** → **Generate Signed Bundle / APK**
3. Select **APK** (not AAB)
4. **First time:** Click **Create new...** to create keystore
   - Keystore path: Choose location (e.g., `android/app/maison-slimani.keystore`)
   - Password: Create strong password (save it!)
   - Key alias: `maison-slimani-key`
   - Key password: Create password (save it!)
   - Validity: 25 years
   - Certificate info: Fill in your details
5. **Next time:** Select existing keystore
6. Select **release** build variant
7. Click **Finish**
8. APK location: `android/app/release/app-release.apk`

#### Step 6: Test APK

```bash
# Install on connected device
adb install android/app/release/app-release.apk

# Or transfer APK to phone and install manually
```

---

### Building Admin App APK

Same process, but from `admin-app/` directory:

```bash
cd admin-app

# Build
npm run build

# Sync Capacitor
npm run admin:cap:sync
# Or: npx cap sync

# Open Android Studio
npm run admin:cap:android
# Or: npx cap open android
```

Then follow same Android Studio steps.

---

## 🎨 Generate PWA Icons (Required!)

You need icons for both apps. Here's the fastest way:

### Option 1: Online Tool (Easiest)

1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 PNG image
3. Download all sizes
4. Place in:
   - Customer: `public/icons/`
   - Admin: `admin-app/public/icons/`

### Option 2: Manual Creation

Create these sizes (PNG format):
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

**Design tips:**
- Use brand colors (dore #D4AF37 for customer, charbon #1A1A1A for admin)
- Keep it simple and recognizable at small sizes
- Maskable icons (192x192, 512x512) need safe zone (80% of canvas)

### Update Manifests

After adding icons, update:
- `public/manifest.json` (customer)
- `admin-app/public/manifest.json` (admin)

Make sure icon paths match your file names.

---

## 🔧 Production Configuration

### Update Capacitor Configs

Before building for production, update server URLs:

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

Ensure production `.env` files have:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET`
- `RESEND_API_KEY`

---

## 📱 App Store Submission

### Google Play Store (Android)

1. **Create Google Play Console Account**
   - Go to: https://play.google.com/console
   - Pay $25 one-time fee

2. **Prepare Store Listing**
   - App name, description, screenshots
   - Privacy policy URL (required)
   - App icon (512x512)
   - Feature graphic (1024x500)

3. **Upload APK/AAB**
   - Build AAB instead of APK for Play Store (better)
   - In Android Studio: Build → Generate Signed Bundle → Select **AAB**
   - Upload to Play Console → Production

4. **Complete Store Listing**
   - Fill all required fields
   - Set pricing (free/paid)
   - Add content rating

5. **Submit for Review**
   - Usually takes 1-3 days

### Apple App Store (iOS)

1. **Create Apple Developer Account**
   - Go to: https://developer.apple.com
   - Pay $99/year

2. **Create App ID**
   - In Apple Developer Portal
   - Bundle ID: `com.maisonslimani.customer` (or `.admin`)

3. **Build in Xcode**
   ```bash
   npm run cap:ios:customer
   # Or: npx cap open ios
   ```

4. **Archive and Upload**
   - In Xcode: Product → Archive
   - Distribute App → App Store Connect
   - Follow wizard

5. **App Store Connect**
   - Create app listing
   - Upload screenshots
   - Add description
   - Submit for review

---

## 🚀 Deployment Checklist

### Before Building APKs

- [ ] Generate all PWA icons
- [ ] Update manifest.json files with icon paths
- [ ] Test production build locally
- [ ] Update Capacitor configs with production URLs
- [ ] Set up production environment variables
- [ ] Test on physical devices

### Before App Store Submission

- [ ] Create developer accounts (Google Play, Apple)
- [ ] Prepare store listings (screenshots, descriptions)
- [ ] Create privacy policy page
- [ ] Test APK/IPA on multiple devices
- [ ] Set up crash reporting (Sentry, Firebase)
- [ ] Configure push notifications (Firebase, APNs)

### Post-Launch

- [ ] Monitor crash reports
- [ ] Set up analytics
- [ ] Plan update schedule
- [ ] Collect user feedback
- [ ] Monitor app store reviews

---

## 🐛 Troubleshooting

### Service Worker Not Working
- Ensure HTTPS (or localhost)
- Clear browser cache
- Check browser console for errors

### Capacitor Sync Fails
- Delete `android/` and `ios/` folders
- Run `npx cap sync` again
- Check `capacitor.config.json` syntax

### Build Errors
- Clear `.next` and `node_modules`
- Reinstall dependencies: `npm install`
- Check Node.js version (18+)

### APK Won't Install
- Enable "Install from unknown sources" on Android
- Check APK signature
- Verify minimum SDK version matches device

---

## 📚 Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **PWA Builder**: https://www.pwabuilder.com
- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com
- **Android Studio**: https://developer.android.com/studio
- **Xcode**: https://developer.apple.com/xcode

---

## 💡 Quick Commands Reference

```bash
# Development
npm run dev                    # Customer PWA (add ?pwa=true)
npm run admin:dev              # Admin PWA

# Build
npm run build                  # Customer app
npm run admin:build            # Admin app

# Capacitor
npm run cap:sync:customer      # Sync customer app
npm run cap:android:customer   # Open Android (customer)
npm run cap:ios:customer       # Open iOS (customer)
npm run admin:cap:sync         # Sync admin app
npm run admin:cap:android      # Open Android (admin)
npm run admin:cap:ios          # Open iOS (admin)
```

---

**Ready to start? Begin with local testing, then move to APK building!** 🚀

