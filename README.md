# Expo PocketBase Starter

A full-stack starter template for building cross-platform mobile applications with Expo (React Native) and PocketBase backend. This template provides a production-ready foundation with authentication, offline-first data synchronization, real-time updates, and a complete development workflow.

## Overview

This project consists of two main parts:

- **Mobile App** (`mobile/`) - Expo-based React Native application with offline-first capabilities
- **Backend Server** (`server/`) - PocketBase instance running in Docker

### Key Technologies

- **Frontend**: Expo SDK 54, React Native, React 19, Expo Router, TypeScript
- **Backend**: PocketBase (self-hosted BaaS)
- **Database**: WatermelonDB (offline-first local database)
- **Styling**: react-native-unistyles (utility-first styling)
- **Forms**: react-hook-form + zod validation
- **Realtime**: Server-Sent Events (SSE) via react-native-sse

## Features

### Authentication
- User registration and login
- Secure token storage using Expo SecureStore
- Protected API routes
- Session persistence
- Server URL configuration

### Data Management
- Offline-first architecture with WatermelonDB
- Automatic sync between local and remote data
- Real-time updates via SSE subscriptions
- Conflict resolution strategies
- CRUD operations example with Notes feature

### Developer Experience
- TypeScript support throughout
- Type-safe PocketBase API client (auto-generated types)
- Biome for linting and formatting
- Jest testing framework
- Hot reload with Expo Dev Client
- Comprehensive error boundaries

### UI Components
- Reusable component library
- Form components (inputs, selects, checkboxes, toggles)
- Navigation components
- Toast notifications (sonner-native)
- Onboarding screens
- Custom tab bar

## Architecture

### Data Flow

```
PocketBase (Source of Truth)
    ↓
WatermelonDB (Local Cache)
    ↓
React Components
```

Three-way synchronization:
1. **Pull Sync**: Periodic fetch from PocketBase → WatermelonDB
2. **Push Sync**: Write to PocketBase first, then upsert to WatermelonDB
3. **Realtime**: SSE events upsert directly to WatermelonDB

### Auth Flow

1. User enters server URL → Stored in SecureStore
2. Sign up/Login → Auth token stored in SecureStore
3. All requests include auth automatically via PocketBase SDK

### Project Structure

```
expo-pocketbase/
├── mobile/                    # Expo React Native app
│   ├── src/
│   │   ├── app/              # Expo Router screens
│   │   │   ├── (auth)/       # Authentication screens
│   │   │   └── (tabs)/       # Main app tabs
│   │   ├── api/              # PocketBase client and realtime
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (Auth, Database)
│   │   ├── db/               # WatermelonDB setup
│   │   ├── hooks/            # Custom React hooks
│   │   ├── styles/           # Theme and styling
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities and helpers
│   ├── assets/               # Images, fonts, icons
│   └── package.json
└── server/                   # PocketBase backend
    ├── pb_migrations/        # Database schema migrations
    ├── pb_hooks/            # Custom hooks
    ├── docker-compose.yml   # Docker configuration
    └── .env.example         # Environment template
```

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (macOS only)
- For Android: Android Studio with Android SDK

## Quick Start

### 1. Clone and Install

```bash
# Install root dependencies (if any)
cd mobile
npm install
```

### 2. Start PocketBase Server

```bash
cd server
cp .env.example .env
# Edit .env and set your admin credentials
docker compose up -d
```

The PocketBase admin UI will be available at: http://localhost:8090/_/

### 3. Configure Mobile App

```bash
cd mobile
cp .env.example .env
# Edit .env and set your PocketBase credentials for type generation
```

### 4. Generate PocketBase Types

```bash
npm run typegen
```

### 5. Run the App

```bash
# iOS simulator
npm run ios

# Android emulator
npm run android

# Web
npm run web
```

First launch will show the onboarding screens, then you'll be prompted to:
1. Enter your PocketBase server URL (default: http://127.0.0.1:8090)
2. Sign up or log in

## Usage

### Creating a Note

1. Navigate to the Notes tab
2. Tap the "+" button to create a new note
3. Enter title and content
4. Save - the note is synced to PocketBase
5. Test offline mode by disabling network - note still accessible locally
6. Reconnect - changes sync automatically

### Admin Panel

Access the PocketBase admin panel at http://localhost:8090/_/ to:
- View and manage users
- Inspect notes data
- Configure collection rules
- Monitor API logs

## Development

### Available Scripts

#### Mobile (mobile/)

```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run on web
npm run lint           # Lint with Biome
npm run format         # Format with Biome
npm run check          # Run lint and format checks
npm run test           # Run Jest tests
npm run test:watch     # Run Jest in watch mode
npm run test:coverage  # Run tests with coverage
npm run typegen        # Generate PocketBase types
```

#### Server (server/)

```bash
docker compose up -d    # Start PocketBase container
docker compose down     # Stop PocketBase container
docker compose logs -f  # View logs
```

### Adding New Collections

1. Create PocketBase migration in `server/pb_migrations/`

```javascript
// server/pb_migrations/1000000001_add_posts.js
migrate((app) => {
  const posts = new Collection({
    type: "base",
    name: "posts",
    // Add your fields and rules
  });
  app.save(posts);
}, (app) => {
  // Rollback logic
});
```

2. Create WatermelonDB model in `mobile/src/db/models/`

```typescript
// mobile/src/db/models/Post.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';

export default class Post extends Model {
  static table = 'posts';
  static associations = {
    comments: { type: 'has_many', foreignKey: 'post_id' },
  };
  @field('title') title;
  @field('content') content;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
}
```

3. Update `mobile/src/db/schema.ts` to add the table

```typescript
// mobile/src/db/schema.ts
import { appSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 2,
  tables: [
    // ... existing tables
    Post,
  ],
});
```

4. Create a hook in `mobile/src/hooks/` for CRUD operations

```typescript
// mobile/src/hooks/usePosts.ts
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb/QueryDescription';

export function usePosts() {
  const database = useDatabase();

  const createPost = async (title: string, content: string) => {
    await database.write(async () => {
      await database.get<Post>('posts').create(post => {
        post.title = title;
        post.content = content;
      });
    });
  };

  // ... other CRUD operations

  return { createPost /* ... */ };
}
```

5. Add sync support in `mobile/src/db/sync.ts` and `mobile/src/api/realtime.ts`

6. Regenerate PocketBase types: `npm run typegen`

### Customizing the Theme

Edit `mobile/src/styles/index.ts` to modify colors, fonts, and spacing:

```typescript
export const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    // ... add your colors
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    // ... add your spacing values
  },
};
```

### Testing

The project includes Jest for testing. Run tests with:

```bash
npm test                    # Run all tests
npm run test:watch         # Run in watch mode
npm run test:coverage      # Generate coverage report
```

Example test:

```typescript
// mobile/src/utils/__tests__/config.test.ts
import { getConfig } from '../config';

describe('config', () => {
  it('should get config', async () => {
    const config = await getConfig();
    expect(config).toBeDefined();
  });
});
```

## Production Deployment

### Mobile App

1. Update `mobile/app.json`:
   - Change app name and slug
   - Update bundle identifier (iOS) and package name (Android)
   - Replace icons and splash screens
   - Update version number

2. Build for production:
   ```bash
   # iOS
   eas build --platform ios

   # Android
   eas build --platform android
   ```

3. Submit to App Store/Play Store following Expo's deployment docs

### Server

1. Update `server/docker-compose.yml`:
   - Add volume for persistent data backup
   - Configure environment variables for production
   - Add health checks

2. Deploy to your preferred hosting:
   - DigitalOcean App Platform
   - AWS ECS
   - Google Cloud Run
   - Any VPS with Docker support

3. Update mobile app to use production server URL

## Environment Variables

### Server (server/.env)

```bash
PB_LOG_LEVEL=info                          # Logging level
PB_ADMIN_EMAIL=your_email@example.com     # Admin email
PB_ADMIN_PASSWORD=secure_password         # Admin password
```

### Mobile (mobile/.env)

```bash
PB_TYPEGEN_URL=http://127.0.0.1:8090       # PocketBase URL for type generation
PB_TYPEGEN_EMAIL=your_email@example.com   # Admin email
PB_TYPEGEN_PASSWORD=secure_password       # Admin password
```

## Troubleshooting

### Server Won't Start

```bash
# Check Docker logs
cd server
docker compose logs pocketbase

# Restart container
docker compose restart
```

### Sync Issues

- Check network connectivity
- Verify PocketBase server is running
- Check auth token is valid
- Review sync logs in the app

### Type Generation Fails

- Ensure PocketBase server is running at the specified URL
- Verify admin credentials in .env
- Check that migrations have been applied

### Build Errors

- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo SDK version compatibility

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
