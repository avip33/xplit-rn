# Xplit - Modern React Native App with Supabase

This is a modern [Expo](https://expo.dev) project with **TanStack Query**, **Zustand**, and **Supabase** integration for scalable state management and backend services.

## Architecture

- **TanStack Query** - Server state management (Supabase data)
- **Zustand** - Local/UI state with persistence
- **Context API** - Stable app-wide configuration
- **Supabase** - Backend as a Service with real-time features

## Quick Start

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables

   ```bash
   npm run setup-env
   ```

   Or manually create a `.env` file with your Supabase credentials (see `env.example`).

3. Set up your Supabase database

   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL from `ARCHITECTURE.md` to create the required tables
   - Enable Row Level Security and set up policies

4. Start the app

   ```bash
   npm start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Features

- 🔐 **Authentication** - Complete sign up/sign in flow with Supabase Auth
- 👤 **Profile Management** - User profiles with real-time updates
- 🎨 **Theme Support** - Light/dark mode with system preference
- 📱 **Cross Platform** - Works on iOS, Android, and Web
- ⚡ **Real-time** - Live updates with Supabase subscriptions
- 💾 **Offline Support** - TanStack Query caching and Zustand persistence

## Documentation

- [Architecture Guide](ARCHITECTURE.md) - Detailed setup and usage instructions
- [Supabase Setup](https://supabase.com/docs) - Backend configuration
- [TanStack Query](https://tanstack.com/query/latest) - Server state management
- [Zustand](https://github.com/pmndrs/zustand) - State management

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
