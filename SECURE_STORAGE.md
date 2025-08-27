# Secure Storage Implementation

This document outlines the implementation of secure storage for authentication tokens in the Xplit app using `expo-secure-store`.

## Overview

The app now uses secure storage for authentication tokens using `expo-secure-store`, providing enterprise-grade security for user sessions.

## Security Benefits

### 🔐 **Secure Storage vs AsyncStorage**
- **AsyncStorage**: Plain text storage, vulnerable to device theft/unlocking
- **SecureStore**: Uses iOS Keychain / Android Keystore, encrypted storage
- **Protection**: Tokens are protected even if device is compromised

### 🛡️ **Security Features**
- **iOS Keychain**: Uses Apple's secure keychain storage
- **Android Keystore**: Uses Android's secure keystore storage
- **Encryption**: Tokens are encrypted at rest
- **Access Control**: Configurable access policies

## Implementation

### 1. **Dependencies**
```bash
npx expo install expo-secure-store
npm install react-native-url-polyfill
```

### 2. **SecureStore Adapter** (`lib/supabase.ts`)
```typescript
import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';

const SecureStoreAdapter = {
  getItem: (key: string) => {
    console.log('SecureStore getItem:', key);
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    console.log('SecureStore setItem:', key, 'value stored');
    return SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  },
  removeItem: (key: string) => {
    console.log('SecureStore removeItem:', key);
    return SecureStore.deleteItemAsync(key);
  },
};
```

### 3. **Supabase Configuration**
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN apps don't use URL hash flows
    storage: SecureStoreAdapter,
  },
});
```

## Key Features

### 🔑 **Access Control Options**
- `AFTER_FIRST_UNLOCK`: Available after first device unlock (default)
- `ALWAYS`: Always accessible (less secure)
- `WHEN_UNLOCKED`: Only when device is unlocked
- `WHEN_PASSCODE_SET_THIS_DEVICE_ONLY`: Most secure, requires passcode

### 🔄 **Automatic Session Management**
- **Token Storage**: Access and refresh tokens stored securely
- **Auto Refresh**: Tokens automatically refreshed in background
- **Session Persistence**: Sessions persist across app restarts
- **Secure Cleanup**: Tokens properly removed on sign out

### 📱 **Platform Support**
- **iOS**: Uses Keychain Services
- **Android**: Uses Android Keystore
- **Web**: Falls back to localStorage (development only)

## Usage

### **Authentication Flow**
1. User signs in → Tokens stored in SecureStore
2. App restarts → Tokens retrieved from SecureStore
3. Session restored → User automatically authenticated
4. Token refresh → New tokens stored securely
5. User signs out → Tokens removed from SecureStore

### **Debugging**
```typescript
// Check if tokens are stored
const debugStorage = async () => {
  const commonKeys = [
    'sb-vknuortfipvywyntohrz-auth-token',
    'sb-vknuortfipvywyntohrz-auth-token-refresh',
  ];
  
  for (const key of commonKeys) {
    const value = await SecureStore.getItemAsync(key);
    console.log(`SecureStore key: ${key}`, value ? 'has value' : 'no value');
  }
};
```

## Security Considerations

### 🚨 **Threat Model**
- **Device Theft**: Tokens protected by device security
- **App Compromise**: Tokens encrypted at rest
- **Network Attacks**: Tokens transmitted over HTTPS
- **Physical Access**: Tokens protected by device unlock

### 🔒 **Best Practices**
- Use `AFTER_FIRST_UNLOCK` for good UX/security balance
- Implement biometric unlock for additional security
- Clear tokens on app uninstall
- Monitor for suspicious activity

## Alternative: Encrypted MMKV

If you need faster storage with encryption:

```typescript
import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';

async function getOrCreateEncryptionKey() {
  let key = await SecureStore.getItemAsync('mmkv_encryption_key');
  if (!key) {
    const random = globalThis.crypto?.getRandomValues?.(new Uint8Array(32));
    key = Buffer.from(random ?? []).toString('base64');
    await SecureStore.setItemAsync('mmkv_encryption_key', key);
  }
  return key;
}

const encryptionKeyPromise = getOrCreateEncryptionKey();

export async function makeSupabase() {
  const encryptionKey = await encryptionKeyPromise;
  const mmkv = new MMKV({ encryptionKey });

  const MMKVAdapter = {
    getItem: (key: string) => Promise.resolve(mmkv.getString(key) ?? null),
    setItem: (key: string, value: string) => Promise.resolve(mmkv.set(key, value)),
    removeItem: (key: string) => Promise.resolve(mmkv.delete(key)),
  };

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: MMKVAdapter,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}
```

## Testing

### **Manual Testing**
1. Sign in to the app
2. Check console logs for SecureStore operations
3. Close app completely
4. Reopen app
5. Verify session is restored automatically
6. Check that tokens are stored securely

### **Expected Logs**
```
SecureStore setItem: sb-xxx-auth-token value stored
SecureStore getItem: sb-xxx-auth-token
useAuth: Current session result: has session error: null
```

## Troubleshooting

### **Common Issues**
1. **Session not persisting**: Check SecureStore permissions
2. **Tokens not stored**: Verify SecureStore adapter configuration
3. **Access denied**: Check keychain accessibility settings
4. **Platform differences**: Ensure proper platform-specific setup

### **Debug Steps**
1. Check console logs for SecureStore operations
2. Verify tokens are being stored/retrieved
3. Test on both iOS and Android
4. Check device security settings

## Future Enhancements

### **Biometric Authentication**
```typescript
// Add biometric unlock requirement
keychainAccessible: SecureStore.WHEN_UNLOCKED,
requireAuthentication: true,
```

### **Multi-Device Sync**
- Implement secure token synchronization
- Handle concurrent sessions
- Device-specific security policies

### **Advanced Security**
- Token rotation policies
- Session timeout configuration
- Device trust management
- Suspicious activity detection

## Status: ✅ **IMPLEMENTED**

SecureStore is now active and being used for authentication token storage. The app provides enterprise-grade security for user sessions with persistent authentication.
