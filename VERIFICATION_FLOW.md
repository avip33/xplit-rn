# Email Verification Flow

This document explains how the email verification flow works in the Xplit app using Supabase authentication.

## Flow Overview

1. **Signup Process**
   - User enters email and password on the signup screen
   - App calls `supabase.auth.signUp()` with the credentials
   - Supabase sends a verification email to the user
   - If the user needs email verification, they are redirected to the verification screen

2. **Verification Screen**
   - Shows the email address that needs verification
   - Provides instructions to check email and click verification link
   - Has a "Check Status" button to verify if email was confirmed
   - Includes options to resend verification email or open email app

3. **Email Verification**
   - User receives email from Supabase with verification link
   - Clicking the link confirms the email address
   - User returns to app and clicks "Check Status"
   - If verified, user is redirected to main app

## Key Components

### UI Store (`stores/ui.ts`)
- `emailForVerification`: Stores the email address that needs verification
- `setEmailForVerification`: Function to set/clear the email

### Signup Screen (`app/signup.tsx`)
- Uses `useSignUp()` hook for Supabase authentication
- After successful signup, checks if email verification is needed
- If needed, stores email and navigates to verification screen

### Verification Screen (`app/verification.tsx`)
- Shows verification status and instructions
- Provides "Check Status" button to verify email confirmation
- Includes resend functionality using `supabase.auth.resend()`
- Handles navigation back to signup or to main app

## Supabase Configuration

Make sure your Supabase project has email verification enabled:

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable "Enable email confirmations"
3. Configure your email templates if needed

## Testing

To test the verification flow:

1. Sign up with a new email address
2. Check your email for the verification link
3. Click the verification link
4. Return to the app and click "Check Status"
5. You should be redirected to the main app

## Error Handling

The app handles various error scenarios:
- Invalid email format
- Password too short
- Network errors during signup
- Verification failures
- Email not found during resend

## Future Enhancements

Potential improvements:
- Add SMS verification option
- Implement OAuth providers (Google, Apple, etc.)
- Add biometric authentication
- Implement password strength requirements
- Add account recovery options
