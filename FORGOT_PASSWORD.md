# Forgot Password Functionality

This document explains how the forgot password functionality works in the Xplit app.

## Overview

The forgot password feature allows users to reset their password if they've forgotten it. The flow consists of three main screens:

1. **Forgot Password Screen** (`/forgot-password`) - User enters their email
2. **Email Sent Success Screen** - Confirmation that reset email was sent
3. **Reset Password Screen** (`/reset-password`) - User sets new password

## Flow

### 1. User Requests Password Reset

- User clicks "Forgot Password?" on the login screen
- User is navigated to `/forgot-password`
- User enters their email address
- App validates email format
- App calls Supabase `resetPasswordForEmail()` function
- Reset link is sent to user's email

### 2. User Receives Email

- User receives email with password reset link
- Link contains a token that expires in 1 hour
- Link redirects to `xplit://reset-password` (deep link)

### 3. User Resets Password

- User clicks link in email
- App opens to `/reset-password` screen
- User enters new password (with validation)
- User confirms new password
- App calls Supabase `updateUser()` function
- Password is updated in database
- User is redirected to login screen

## Technical Implementation

### Auth Hook (`hooks/useAuth.ts`)

```typescript
const resetPassword = useMutation({
  mutationFn: async ({ email }: { email: string }) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'xplit://reset-password',
    });
    if (error) throw error;
  },
});
```

### Deep Linking

The app uses the `xplit://` scheme for deep linking. When users click the reset link in their email, it opens the app directly to the reset password screen.

### Password Validation

The reset password screen validates:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Passwords must match

## Error Handling

The app handles various error scenarios:

- **Invalid email format** - Shows validation error
- **User not found** - Shows "No account found" message
- **Network errors** - Shows generic error message
- **Password validation** - Shows specific validation requirements
- **Password mismatch** - Shows "Passwords don't match" error

## Security Features

- Reset links expire after 1 hour
- Passwords must meet security requirements
- Email validation prevents invalid requests
- Secure token-based reset process

## Testing

To test the forgot password functionality:

1. Go to login screen
2. Click "Forgot Password?"
3. Enter a valid email
4. Check email for reset link
5. Click link to open reset screen
6. Enter new password
7. Verify password was updated

## Files

- `app/forgot-password.tsx` - Forgot password screen
- `app/reset-password.tsx` - Reset password screen
- `hooks/useAuth.ts` - Auth hook with reset functionality
- `app/login.tsx` - Updated with forgot password link
