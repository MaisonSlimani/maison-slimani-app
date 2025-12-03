# Push Token Setup Guide

This guide explains how to get push tokens for Android and iOS devices.

## How It Works

1. **App loads** → `registerPushNotifications()` is called (in admin layouts)
2. **Listeners are set up** → Wait for token events
3. **Permission is requested** → User grants/denies notification permission
4. **Registration is initiated** → `PushNotifications.register()` is called
5. **Token is received** → `registration` event fires with the token
6. **Token is saved** → Automatically saved to `admin_push_tokens` table in Supabase

## Current Implementation

The push token registration is **already implemented** and **automatically called** when:
- Admin app loads (after authentication)
- Both `/admin` and `/pwa` layouts call `registerPushNotifications()`

## Setup Requirements

### For Android (Firebase Cloud Messaging)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing
   - Add Android app with package name: `com.maisonslimani.admin`

2. **Download `google-services.json`**
   - Download from Firebase Console
   - Place in `admin-app/android/app/` directory

3. **Get FCM Server Key**
   - Firebase Console → Project Settings → Cloud Messaging
   - Copy the **Server Key** (legacy) or create Cloud Messaging API (V1) key
   - Add to Supabase Edge Function environment variables as `FCM_SERVER_KEY`

4. **Update `android/build.gradle`**
   ```gradle
   buildscript {
       dependencies {
           classpath 'com.google.gms:google-services:4.4.0'
       }
   }
   ```

5. **Update `android/app/build.gradle`**
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### For iOS (Apple Push Notification Service)

1. **Enable Push Notifications in Xcode**
   - Open `admin-app/ios/App/App.xcworkspace` in Xcode
   - Select your app target
   - Go to "Signing & Capabilities"
   - Click "+ Capability" → Add "Push Notifications"

2. **Create APNs Key**
   - Go to [Apple Developer Portal](https://developer.apple.com/account/)
   - Certificates, Identifiers & Profiles → Keys
   - Create a new key with "Apple Push Notifications service (APNs)"
   - Download the `.p8` key file
   - Note the Key ID and Team ID

3. **Configure Firebase for iOS**
   - Firebase Console → Add iOS app
   - Upload `APNs Authentication Key` (.p8 file)
   - Enter Key ID and Team ID

4. **Update Capacitor Config** (if needed)
   ```json
   {
     "plugins": {
       "PushNotifications": {
         "presentationOptions": ["badge", "sound", "alert"]
       }
     }
   }
   ```

## Testing Push Token Registration

### Check Console Logs

When the app loads, you should see:
```
📱 Push notification registration initiated
✅ Push registration success, token: [YOUR_TOKEN_HERE]
Push token saved successfully
```

### Verify Token in Database

Check if token was saved:
```sql
SELECT * FROM admin_push_tokens WHERE active = true;
```

### Test Push Notification

1. Create a test order via main app
2. Check Edge Function logs in Supabase Dashboard
3. Verify notification is received on device

## Troubleshooting

### Token Not Received

**Check:**
1. **Permissions**: Ensure notification permission is granted
   ```javascript
   const status = await PushNotifications.checkPermissions()
   console.log('Permission status:', status)
   ```

2. **Platform**: Only works on native platforms (iOS/Android)
   ```javascript
   console.log('Is native:', Capacitor.isNativePlatform())
   ```

3. **Firebase/APNs Setup**: Ensure Firebase/APNs is properly configured
4. **Console Errors**: Check browser/device console for errors

### Registration Error

**Common errors:**
- `registrationError`: Check Firebase/APNs configuration
- Permission denied: User needs to grant notification permission
- Network error: Check device internet connection

### Token Not Saved to Database

**Check:**
1. Supabase connection: Ensure `NEXT_PUBLIC_SUPABASE_URL` and keys are set
2. RLS Policies: Ensure user has permission to insert into `admin_push_tokens`
3. Console logs: Check for error messages when saving token

## Manual Token Registration (For Testing)

If automatic registration doesn't work, you can manually test:

```typescript
import { registerPushNotifications } from '@/lib/push-notifications'

// Call manually
await registerPushNotifications()
```

## Next Steps

1. **Build and test on device** (push notifications don't work in emulator/simulator)
2. **Verify token appears in database**
3. **Test with a real order** to ensure notifications are received

## Important Notes

- ⚠️ Push notifications **only work on native platforms** (iOS/Android)
- ⚠️ They **don't work in web browsers** or emulators
- ⚠️ You need to **build the app** and test on a **real device**
- ⚠️ Firebase/APNs must be **properly configured** before tokens can be obtained

