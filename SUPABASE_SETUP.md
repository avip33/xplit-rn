# Supabase Setup for Xplit

This document outlines the Supabase setup for the Xplit app, including database schema, migrations, and client integration.

## Overview

The Supabase setup provides:
- **User Profiles**: Immutable handles, editable display names, and avatars
- **Row Level Security (RLS)**: Secure access control
- **Storage**: Avatar uploads with proper permissions
- **Search**: Public profile discovery without exposing emails
- **Migrations**: Version-controlled database schema

## Database Schema

### Core Tables

#### `user_profiles`
- `id` (UUID, PK): References `auth.users(id)`
- `handle` (citext, unique): Immutable user handle (2-30 chars, lowercase)
- `display_name` (text): Editable display name
- `bio` (text, nullable): User bio
- `avatar_url` (text, nullable): Avatar image URL
- `created_at` (timestamptz): Creation timestamp
- `updated_at` (timestamptz): Last update timestamp

### Views

#### `profiles_public`
Public read-only view exposing only safe fields:
- `id`, `handle`, `display_name`, `avatar_url`

### Functions

#### Profile Management
- `create_profile(p_handle, p_display_name)`: Create new profile
- `update_profile(p_display_name, p_bio, p_avatar_url)`: Update mutable fields
- `is_handle_available(p_handle)`: Check handle availability
- `search_profiles(q, limit_count)`: Search profiles publicly

## Security Features

### Row Level Security (RLS)
- **Owner-only access**: Users can only access their own profile data
- **Public discovery**: Search function provides safe public access
- **Immutable handles**: Database-level constraint prevents handle changes

### Storage Policies
- **Public read**: Anyone can view avatars
- **Owner-only write**: Users can only upload to their own folder
- **Path structure**: `avatars/{user_id}/avatar.jpg`

## Setup Instructions

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize Supabase (if not already done)

```bash
supabase init
```

### 3. Link to Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Run Migrations

```bash
# Apply migrations to remote project
supabase db push

# Or run locally for development
supabase start
supabase db reset
```

### 5. Generate TypeScript Types

```bash
supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > lib/supabase.types.ts
```

## Environment Variables

Add these to your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Client Integration

### Basic Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
```

### Authentication Flow

1. **Sign Up**: User provides email/password
2. **Email Verification**: User verifies email
3. **Profile Creation**: User creates profile with handle and display name
4. **Main App**: User accesses the full application

### Profile Management

```typescript
// Create profile (one-time during onboarding)
const profile = await createProfileOnce('john_doe', 'John Doe');

// Update profile
await updateProfile({ 
  displayName: 'John Smith',
  bio: 'Software developer'
});

// Upload avatar
const avatarUrl = await uploadAvatar(userId, imageUri);

// Search profiles
const results = await searchProfiles('john', 20);
```

## File Structure

```
supabase/
├── config.toml                 # Supabase configuration
└── migrations/
    ├── 20250122000000_profile_identity.sql
    └── 20250122000001_storage_avatars.sql

lib/
├── supabase.ts                 # Supabase client
├── supabase.types.ts           # Generated types
└── features/
    ├── auth/
    │   └── signUp.ts
    └── profile/
        ├── createProfileOnce.ts
        ├── updateProfile.ts
        ├── searchProfiles.ts
        └── uploadAvatar.ts

hooks/
└── useProfile.ts               # React hooks for profile management

components/
└── ProfileSetup.tsx            # Profile creation UI

app/
└── profile-setup.tsx           # Profile setup route
```

## Key Features

### Immutable Handles
- Handles are chosen once during onboarding
- Database-level constraint prevents changes
- Triggers enforce immutability

### Email Privacy
- Email addresses are never exposed in public APIs
- Only handle and display name are searchable
- Email changes require admin intervention

### Secure Storage
- Users can only upload to their own folder
- Public read access for avatars
- Automatic cleanup on user deletion

### Search Functionality
- Fuzzy search on display names
- Handle prefix matching
- No email exposure in results

## Development Workflow

### Adding New Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply to local development
supabase db reset

# Apply to remote
supabase db push
```

### Testing Locally

```bash
# Start local Supabase
supabase start

# Reset database
supabase db reset

# Stop local Supabase
supabase stop
```

### Type Generation

```bash
# Generate types from remote
supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/supabase.types.ts

# Generate types from local
supabase gen types typescript --local > lib/supabase.types.ts
```

## Troubleshooting

### Common Issues

1. **Migration Errors**: Ensure database version matches config
2. **RLS Policy Issues**: Check user authentication state
3. **Storage Upload Failures**: Verify bucket exists and policies are correct
4. **Type Generation**: Ensure schema is up to date

### Debug Commands

```bash
# Check migration status
supabase migration list

# View local logs
supabase logs

# Check database connection
supabase db ping
```

## Best Practices

1. **Always use migrations** for schema changes
2. **Test RLS policies** thoroughly
3. **Generate types** after schema changes
4. **Use the provided functions** instead of direct table access
5. **Handle errors gracefully** in the client
6. **Validate input** on both client and server

## Security Considerations

- Handles are immutable to prevent impersonation
- Emails are never exposed in public APIs
- Storage policies prevent unauthorized access
- RLS ensures data isolation
- All functions use `security definer` for proper permissions
