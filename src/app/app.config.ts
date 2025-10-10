import {
	APP_INITIALIZER,
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
	provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter, withInMemoryScrolling, withViewTransitions } from "@angular/router";

import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { routes } from "@app/app.routes";
import { initializeFirestore } from "@core/initializers/firestore.initializer";
import { FirestoreInitService } from "@core/services/firestore-init.service";
import { firebaseConfig } from "@environments/environment";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(
			routes,
			withInMemoryScrolling({
				scrollPositionRestoration: "enabled",
				anchorScrolling: "enabled",
			}),
			withViewTransitions(),
		),
		// Firebase Setup - einheitliche Konfiguration
		provideFirebaseApp(() => initializeApp(firebaseConfig)),
		provideFirestore(() => getFirestore()),

		// Firestore Schema Initialization
		{
			provide: APP_INITIALIZER,
			useFactory: initializeFirestore,
			deps: [FirestoreInitService],
			multi: true,
		},
		provideAuth(() => getAuth()),
	],
};
