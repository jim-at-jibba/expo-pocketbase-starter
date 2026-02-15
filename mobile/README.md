# Expo PocketBase Starter

A starter template for building Expo applications with PocketBase backend.

## Quickstart

1. Install dependencies:

```bash
npm install
```

2. Start the PocketBase server:

```bash
cd server
cp .env.example .env
docker compose up -d
```

3. Run the app:

```bash
npm run ios
```

## Scripts

- `npm run start` - start Expo dev server
- `npm run ios` - run on iOS simulator
- `npm run android` - run on Android emulator
- `npm run web` - run on web
- `npm run lint` - lint the project
- `npm run format` - format the project
- `npm run check` - lint and format checks
- `npm run typegen` - generate PocketBase TypeScript types

## Features

- **Authentication**: Sign up, login, and secure storage
- **PocketBase Integration**: Full type-safe API client with auth persistence
- **WatermelonDB**: Offline-first local database with sync
- **Real-time Updates**: SSE subscriptions for instant updates
- **Example Notes CRUD**: Simple notes feature demonstrating the full stack

## Architecture

### Data Flow

```
PocketBase (Source of Truth)
    ↓
WatermelonDB (Local Cache)
    ↓
React Components
```

- **Pull Sync**: Periodic fetch from PocketBase → WatermelonDB
- **Push Sync**: Write to PocketBase first, then upsert to WatermelonDB
- **Realtime**: SSE events upsert directly to WatermelonDB

### Auth Flow

1. User enters server URL → Stored in SecureStore
2. Sign up/Login → Auth token stored in SecureStore
3. All requests include auth automatically via PocketBase SDK

## Config

- PocketBase server URL is stored in SecureStore via `src/utils/config.ts`.
- Environment variables for type generation in `.env`.

## Structure

- `src/app/` - Expo Router screens
- `src/api/` - PocketBase client and realtime manager
- `src/contexts/` - React contexts (Auth, Database)
- `src/db/` - WatermelonDB schema, models, and sync
- `src/hooks/` - Custom React hooks
- `src/components/` - Reusable UI components
- `src/utils/` - Utilities (config, helpers)
- `src/styles/` - Theme and styling
- `src/types/` - TypeScript types (PocketBase types generated)

## Customizing

### Add New Collections

1. Create PocketBase migration in `server/pb_migrations/`
2. Create WatermelonDB model in `src/db/models/`
3. Update `src/db/schema.ts` to add the table
4. Create a hook in `src/hooks/` for CRUD operations
5. Add sync support in `src/db/sync.ts` and `src/api/realtime.ts`
6. Run `npm run typegen` to regenerate PocketBase types

### Customize Theme

Edit `src/styles/index.ts` to modify colors, fonts, and spacing.

## Production

- Update `mobile/app.json` with your app name, bundle ID, and icons
- Update `server/docker-compose.yml` with production settings
- Follow Expo deployment docs for your platform
