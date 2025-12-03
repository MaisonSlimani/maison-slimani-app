# 🚀 Quick Start - Testing & Building PWAs

## 🧪 Testing (Right Now!)

### Customer PWA
```bash
npm run dev
# Visit: http://localhost:3000?pwa=true
```

### Admin PWA
```bash
npm run admin:dev
# Visit: http://localhost:3001
```

---

## 📱 Building APKs

### 1. Install Prerequisites
```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Install Capacitor packages (customer app)
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor/push-notifications @capacitor/share @capacitor/camera

# Install Capacitor packages (admin app)
cd admin-app
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor/push-notifications @capacitor/camera
cd ..
```

### 2. Build & Sync

**Customer App:**
```bash
npm run build
npm run cap:sync:customer
npm run cap:android:customer  # Opens Android Studio
```

**Admin App:**
```bash
cd admin-app
npm run build
npm run admin:cap:sync
npm run admin:cap:android  # Opens Android Studio
```

### 3. Generate APK in Android Studio

1. **Build** → **Generate Signed Bundle / APK**
2. Select **APK**
3. Create keystore (first time) or use existing
4. Select **release** variant
5. APK location: `android/app/release/app-release.apk`

---

## ⚠️ Before Building

1. **Generate Icons**: Use https://www.pwabuilder.com/imageGenerator
   - Upload 512x512 image
   - Download all sizes
   - Place in `public/icons/` (customer) and `admin-app/public/icons/` (admin)

2. **Update Capacitor URLs** (for production):
   - `capacitor.config.json`: `"url": "https://maisonslimani.ma/pwa"`
   - `admin-app/capacitor.config.json`: `"url": "https://admin.maisonslimani.ma"`

---

## 📚 Full Guides

- **Testing & Build Guide**: `PWA_TESTING_AND_BUILD_GUIDE.md`
- **Next Steps**: `NEXT_STEPS.md`
- **Icon Generation**: `scripts/generate-icons.md`

---

## 🎯 Priority Order

1. ✅ Test locally (both PWAs)
2. ✅ Generate icons
3. ✅ Build APKs
4. ✅ Test APKs on devices
5. ✅ Submit to app stores

**Start with #1 right now!** 🚀

