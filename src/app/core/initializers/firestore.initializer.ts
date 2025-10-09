import { inject } from '@angular/core';
import { FirestoreInitService } from '@core/services/firestore-init.service';

/**
 * Application initializer for Firestore schema setup
 * Runs automatically when the application starts
 *
 * This initializer:
 * - Checks if Firestore has been initialized before
 * - Creates sample data and schema if collections are empty
 * - Sets up proper collection structure for Tasks and Contacts
 * - Only runs once per browser session using localStorage flag
 */
export function initializeFirestore(firestoreInitService: FirestoreInitService) {
  return async (): Promise<void> => {
    try {
      // Check if already initialized
      const isInitialized = await firestoreInitService.isInitialized();

      if (!isInitialized) {
        console.log('Starting Firestore initialization...');
        await firestoreInitService.initializeFirestore();

      } else {
        console.log('Firestore already initialized, skipping setup');
      }
    } catch (error) {
      console.error('Firestore initialization failed:', error);
      // Continue app startup even if initialization fails
    }
  };
}
