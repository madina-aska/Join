# Firebase Setup Guide

Quick guide for creating Firebase project and getting database configuration.

## Quick Start

### Automated Setup

```bash
npm run setup:firebase
```

This command automatically creates:
- Unique Firebase project
- Web app configuration
- Firestore database (requires manual API activation)
- Environment configuration

Note: Sample data must be added separately with `npm run migrate:all`

### After Setup

Populate database with sample data:
```bash
npm run migrate:all
```

Then start the application:
```bash
npm start
```

Application available at: http://localhost:4200

## Manual Firebase Project Setup

### Prerequisites

- Node.js (Version 16+)
- Firebase CLI: `npm install -g firebase-tools`

### Step 1: Login to Firebase

```bash
firebase login
```

### Step 2: Create Firebase Project

```bash
firebase projects:create join-app-[your-name]-[timestamp] --display-name "Join App"
```

### Step 3: Enable Firestore API

**Important**: Before creating the database, the Firestore API must be enabled:

1. Visit: `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=[your-project-id]`
2. Click "Enable API"
3. Wait 2-3 minutes for the API to be fully activated

### Step 4: Create Firestore Database

```bash
firebase firestore:databases:create "(default)" --project=[project-id] --location=europe-west1
```

### Step 5: Create Web App

```bash
firebase apps:create web "join-web-app" --project=[project-id]
```

### Step 6: Get Configuration

```bash
firebase apps:sdkconfig WEB [app-id] --project=[project-id]
```

Copy the output configuration.

## Environment Setup

Create `src/environment/environment.ts`:

```typescript
export const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
};

export const environment = {
    production: false,
};
```

## Database Population

After Firebase setup, you have multiple options for database population:

### Automatic Project Setup
```bash
npm run setup:firebase
```
This creates Firebase project, web app, and database (database creation may fail - see below).

**Important**: This does NOT populate data. Use migration scripts after setup.

**If Firestore API activation fails:**
1. Open the Firebase Console for your project
2. Navigate to Firestore Database
3. Click "Create Database" and select your region
4. Then run the migration scripts below to add sample data

### Selective Migration

The migration scripts (TypeScript) work correctly and will populate your Firestore database with sample data:

```bash
# Migrate only tasks collection
npm run migrate:tasks

# Migrate only contacts collection
npm run migrate:contacts

# Migrate both collections
npm run migrate:all
```

Note: These scripts are written in TypeScript and use `ts-node` for execution. They read from `src/environment/environment.ts` automatically.

### Browser-Based Initialization (Recommended)

The application includes automatic initialization that runs in the browser:

1. Ensure `environment.ts` is properly configured
2. Start the development server: `npm start`
3. Open the application in your browser
4. The app will automatically:
   - Detect empty collections
   - Populate with sample data
   - Set initialization flags in localStorage

This method works reliably and doesn't require the migration scripts.

### Manual Population
See [Template Guide](firebase-setup-template.md) for:
- Detailed migration examples
- Collection structures
- Sample data formats
- Troubleshooting

## Available Scripts

```bash
# Automated Firebase setup
npm run setup:firebase

# Complete reset (deletes all data + resets config)
npm run reset:firebase

# Migrate sample data
npm run migrate:all

# Start development
npm start
```

## Troubleshooting

### Firebase CLI not authenticated

```bash
firebase login
```

### Project ID already exists

Run script again (generates new unique ID).

### Firestore API Not Enabled

**Error**: `Cloud Firestore API has not been used in project... before or it is disabled`

**Solution**:
1. Visit: `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=[your-project-id]`
2. Click "Enable API" button
3. Wait 2-3 minutes for activation
4. Manually create database in Firebase Console or re-run setup script

**Alternative**: Create database directly in Firebase Console:
1. Visit `https://console.firebase.google.com/project/[your-project-id]/firestore`
2. Click "Create Database"
3. Select region (e.g., europe-west1)
4. Choose "Start in test mode" for development

### Migration Scripts Not Working

If migration scripts fail:

1. Verify `environment.ts` exists and contains valid Firebase config
2. Ensure Firestore database is created
3. Check Firebase rules allow write access

Alternative: Use the browser-based initialization:
1. Start the app with `npm start`
2. Open in browser
3. The app will auto-initialize the database

### Permission Denied

Set Firestore to test mode in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Environment File Issues

Reset to default shared test database:
```bash
npm run reset:firebase
```

WARNING: This will delete all data from your current database!

To setup a new project instead:
```bash
npm run setup:firebase
```

## Next Steps

1. Complete Firebase setup (this guide)
2. Follow [Template Guide](firebase-setup-template.md) for database population
3. Start development: `npm start`

**Important**: Never commit `environment.ts` to version control.