# Database Population Guide

This guide covers automatic database population and sample data insertion after Firebase project setup.

## Prerequisites

Before following this guide:
1. Complete Firebase project setup (see [SETUP.md](SETUP.md))
2. Ensure `environment.ts` is configured with your Firebase credentials

## Automatic Database Population

### Using Migration Scripts

The migration scripts (TypeScript) work correctly and will populate your Firestore database:

```bash
# Migrate only tasks collection
npm run migrate:tasks

# Migrate only contacts collection
npm run migrate:contacts

# Migrate both collections
npm run migrate:all

# Full Firebase setup (project creation + manual DB setup required)
npm run setup:firebase
```

The scripts are written in TypeScript and use `ts-node` for execution. They automatically read from `src/environment/environment.ts`.

### Browser-Based Initialization (Recommended)

The application includes a reliable browser-based initialization system:

**How it works**:
1. On app startup, the `FirestoreInitService` checks for empty collections
2. If empty, it automatically populates them with sample data
3. Uses localStorage flags to prevent re-initialization

**To use**:
```bash
npm start
# Open http://localhost:4200 in your browser
# Check browser console for initialization logs
```

**Advantages**:
- No TypeScript compilation issues
- Works directly with your environment.ts
- Reliable and well-tested
- Includes error handling and verification

### Script Activation

The migration scripts provide selective control:

#### Tasks Migration (`npm run migrate:tasks`)
- **Creates `tasks` collection** with sample task data
- **Sample data includes**:
  - User registration system task (in-progress)
  - Database schema migration (todo)
  - Performance optimization sprint (in-progress)
- **Task properties**: title, description, category, priority, status, assignedContacts, dueDate, color, subtasks

#### Contacts Migration (`npm run migrate:contacts`)
- **Creates `contacts` collection** with sample contact data
- **Sample data includes**:
  - 8 demo contacts with varied information
  - Complete contact profiles with names, emails, phone numbers
- **Contact properties**: name, email, telephone, color, initials

#### Combined Migration (`npm run migrate:all`)
- **Runs both tasks and contacts migration**
- **Sequential execution**: tasks first, then contacts
- **Individual collection verification**

### Manual Collection Setup

If automatic scripts fail, create collections manually:

```javascript
// Sample task document structure
{
  id: "task-001",
  title: "Sample Task",
  description: "Description text",
  category: "To Do",
  assignedTo: ["contact-001"],
  subtasks: [
    { title: "Subtask 1", completed: false },
    { title: "Subtask 2", completed: true }
  ],
  priority: "Medium",
  dueDate: "2024-12-31",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

```javascript
// Sample contact document structure
{
  id: "contact-001",
  name: "John Doe",
  email: "john@example.com",
  phone: "+49 123 456 789",
  initials: "JD",
  color: "#FF5733",
  createdAt: timestamp
}
```

## Database Verification

After setup, verify collections:

1. **Firebase Console**: Visit your project's Firestore section
2. **Application Logs**: Check browser console for connection status
3. **Data Display**: Confirm sample data appears in application

## Development Mode Security

For development, use permissive security rules:

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

**Important**: Update security rules before production deployment.

## Database Reset

To completely reset your database and configuration:

```bash
npm run reset:firebase
```

This will:
- Delete ALL data from Firestore (tasks & contacts)
- Reset environment.ts to shared test database
- Clear project info files
- Require confirmation (y/N) before proceeding

Use this when:
- You want to start fresh with clean data
- Switching between projects
- Testing migration scripts

## Troubleshooting

### Database Empty After Setup

Run the migration scripts:
```bash
npm run migrate:all
```

Or use browser-based initialization:
```bash
npm start
# Open app in browser - it will auto-populate
```

### Permission Errors

1. Verify security rules in Firebase Console
2. Check authentication status
3. Confirm project ID matches environment configuration

### Script Execution Issues

If scripts fail, check:
1. `environment.ts` contains valid Firebase config
2. Firestore database exists
3. Firestore rules allow write access

Alternative approach:
```bash
npm start  # Browser-based initialization
```

To reset and start fresh:
```bash
npm run reset:firebase  # WARNING: Deletes ALL data + resets config!
npm run setup:firebase  # Creates new project (manual DB setup needed)
npm run migrate:all     # Populate with sample data
```

## Next Steps

1. Start development server: `npm start`
2. Verify data loading in application
3. Begin feature development with populated database