import { inject, Injectable, OnDestroy, signal } from "@angular/core";
import { Router } from "@angular/router";
import { from, Observable } from "rxjs";
import { map, take, tap } from "rxjs/operators";

import {
	Auth,
	authState,
	browserSessionPersistence,
	createUserWithEmailAndPassword,
	setPersistence,
	signInAnonymously,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
	UserCredential,
} from "@angular/fire/auth";

import { Contact } from "@core/interfaces/contact";
import { AppUser } from "@core/interfaces/user";
import { ToastService } from "@shared/services/toast.service";
import { ContactService } from "./contact-service";

@Injectable({
	providedIn: "root",
})
export class AuthService implements OnDestroy {
	// --- DEPENDENCIES ---
	private firebaseAuth = inject(Auth);
	private router = inject(Router);
	private toastService = inject(ToastService);
	private contactService = inject(ContactService);

	readonly firebaseUser$ = authState(this.firebaseAuth);
	currentUser = signal<AppUser | null>(null);

	readonly isLoggedIn$: Observable<boolean> = this.firebaseUser$.pipe(map((user) => !!user));

	constructor() {
		this.firebaseUser$.subscribe((firebaseUser) => {
			if (firebaseUser) {
				const appUser: AppUser = {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					displayName: firebaseUser.displayName,
					isGuest: firebaseUser.isAnonymous,
				};
				this.currentUser.set(appUser);
			} else {
				this.currentUser.set(null);
			}
		});
	}

	// --- PUBLIC API FOR AUTH STATUS ---
	isLoggedIn(): Observable<boolean> {
		return this.isLoggedIn$;
	}

	isLoggedInOnce(): Observable<boolean> {
		return this.isLoggedIn$.pipe(take(1));
	}

	// --- CORE METHODS ---

	signUp(email: string, password: string, displayName: string): Observable<void> {
		const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(
			(userCredential: UserCredential) => {
				const userName = this.capitalizeNames(displayName);
				if (userCredential.user && displayName) {
					const userAsContact: Contact = {
						name: userName,
						email: email,
						telephone: "",
						initials: this.contactService.generateInitials(userName),
						color: this.getRandomColor(),
					};
					this.contactService.addContact(userAsContact);
					return updateProfile(userCredential.user, { displayName: displayName });
				}
				return Promise.resolve();
			},
		);

		return from(promise).pipe(
			tap(() => {
				this.toastService.showSuccess("Registrierung erfolgreich", "Willkommen an Bord!");
				this.router.navigate(["/login"]);
			}),
			map(() => undefined as void),
		);
	}

	signIn(email: string, password: string): Observable<void> {
		const promise = setPersistence(this.firebaseAuth, browserSessionPersistence)
			.then(() => {
				return signInWithEmailAndPassword(this.firebaseAuth, email, password);
			})
			.catch((error) => {
				// Handle Errors here.
				console.error(error);
			});

		return from(promise).pipe(
			tap(() => {
				this.toastService.showSuccess("Anmeldung erfolgreich", "Sie sind jetzt eingeloggt.");
				this.router.navigate(["/summary"]);
			}),
			map(() => undefined as void),
		);
	}

	signInAsGuest(): Observable<void> {
		const promise = signInAnonymously(this.firebaseAuth);

		return from(promise).pipe(
			tap(() => {
				this.toastService.showInfo("Gast-Login", "Sie sind jetzt als Gast angemeldet.");
				this.router.navigate(["/summary"]);
			}),
			map(() => undefined as void),
		);
	}

	signOut(): Observable<void> {
		const promise = signOut(this.firebaseAuth);

		return from(promise).pipe(
			tap(() => {
				this.toastService.showInfo("Abmeldung", "Sie wurden erfolgreich abgemeldet.");
			}),
			map(() => {
				this.router.navigate(["/login"]);
				return undefined as void;
			}),
		);
	}

	ngOnDestroy() {
		this.signOut();
	}

	private getRandomColor(): number {
		return Math.floor(Math.random() * 10) + 1;
	}

	private capitalizeNames(name: string): string {
		return name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	}
}
