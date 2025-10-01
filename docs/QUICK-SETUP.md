# Quick Setup Guide

Simple guide to setup your existing Firebase project with Firestore database.

## Prerequisites

- Firebase CLI installed and logged in
- Existing Firebase project (join-tasksdb)

## Step 1: Enable Firestore API

Before creating the database, enable the Firestore API:

1. Open: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=join-tasksdb
2. Click "Enable API"
3. Wait 2-3 minutes for activation

## Step 2: Create Firestore Database

```bash
firebase firestore:databases:create "(default)" --project=join-tasksdb --location=europe-west1
```

## Step 3: Create Web App

```bash
firebase apps:create web "join-web-app" --project=join-tasksdb
```

This will output an App ID. Copy it for the next step.

## Step 4: Get Firebase Configuration

Replace [APP-ID] with the App ID from Step 3:

```bash
firebase apps:sdkconfig WEB [APP-ID] --project=join-tasksdb
```

Copy the JSON output.

## Step 5: Update Environment File

Open `src/environment/environment.ts` and replace with:

```typescript
export const firebaseConfig = {
    apiKey: "YOUR-API-KEY",
    authDomain: "join-tasksdb.firebaseapp.com",
    projectId: "join-tasksdb",
    storageBucket: "join-tasksdb.firebasestorage.app",
    messagingSenderId: "YOUR-SENDER-ID",
    appId: "YOUR-APP-ID",
};

export const environment = {
    production: false,
};
```

Use the values from Step 4.

## Step 6: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules --project=join-tasksdb
```

## Step 7: Start App and Auto-Migrate Data

```bash
npm start
```

Open http://localhost:4200 in your browser.

The app will automatically:
- Detect empty collections
- Create sample data for tasks and contacts
- Set initialization flags

Check the browser console for migration logs.

## Verification

Check your Firebase Console:
https://console.firebase.google.com/u/0/project/join-tasksdb/firestore

You should see two collections:
- tasks (with sample tasks)
- contacts (with sample contacts)

## Reset Database

To completely reset your database and configuration:

```bash
npm run reset:firebase
```

WARNING: This will:
- Delete all data (tasks & contacts)
- Reset to shared test database config
- Require confirmation before proceeding

## Troubleshooting

### Firestore API Error

If Step 2 fails with "API not enabled":
- Complete Step 1 first
- Wait 5 minutes
- Try Step 2 again

### Permission Denied

Check firestore.rules in Firebase Console. For development, use:

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

### No Data After Starting App

1. Check browser console for errors
2. Clear localStorage: `localStorage.clear()`
3. Refresh page
4. Data should populate automatically