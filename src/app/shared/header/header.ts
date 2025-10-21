import { Component, inject, input } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { PopoverButtonDirective } from "@core/directives/popover-button-directive";
import { PopoverDirective } from "@core/directives/popover-directive";
import { Contact } from "@core/interfaces/contact";
import { AuthService } from "@core/services/auth-service";
import { ContactService } from "@core/services/contact-service";
import { Popover } from "@shared/components/popover/popover";
import { ProfilePicture } from "@shared/components/profile-picture/profile-picture";

/**
 * Displays the application header with branding and optional user profile.
 *
 * @example
 * ```html
 * <!-- Header without profile -->
 * <app-header></app-header>
 *
 * <!-- Header with user profile -->
 * <app-header [profile]="currentUser"></app-header>
 * ```
 */
@Component({
	selector: "app-header",
	imports: [PopoverButtonDirective, Popover, PopoverDirective, RouterLink, ProfilePicture],
	templateUrl: "./header.html",
	styleUrls: ["./header.scss"],
})
export class Header {
	/**
	 * Optional user profile information for display in header.
	 * If provided, displays user name and avatar.
	 */
	profile = input<Contact>();

	/**
	 * Indicates whether the user is currently logged in.
	 * Controls the visibility of user-specific elements in the header.
	 */
	loggedIn = input<boolean>(false);

	/**
	 * Angular Router instance for navigation.
	 * Used to navigate to legal, help and privacy pages.
	 */
	router = inject(Router);

	/**
	 * Authentication service for handling user sign-in and sign-out.
	 * Provides user authentication status and sign-out functionality.
	 */
	authService = inject(AuthService);

	/**
	 * Contact service for retrieving user contact information.
	 * Used to fetch user profile details based on email.
	 */
	contactService = inject(ContactService);

	/**
	 * Holds the current user profile as a Contact object.
	 * Updated when user authentication state changes.
	 */
	currentUser = null;

	/**
	 * Holds the user profile information retrieved from the Contact service.
	 * Used for displaying user details in the header.
	 */
	userAsContact: Contact | undefined;

	/**
	 * Subscribes to the authentication service to update the user profile
	 * whenever the authentication state changes.
	 * Fetches user contact information based on the user's email.
	 */
	constructor() {
		this.authService.firebaseUser$.subscribe((user) => {
			if (!user?.email) return;
			const userAsContact$ = this.contactService.getContactByEmail(user?.email || "");
			userAsContact$.forEach((contact) => {
				this.userAsContact = contact;
			});
		});
	}

	/**
	 * Navigates to the legal notice page.
	 * Triggered by user interaction with the legal notice link in the header.
	 */
	navigateToLegal() {
		this.router.navigate(["legal-notice"]);
	}

	/**
	 * Navigates to the privacy policy page.
	 * Triggered by user interaction with the privacy policy link in the header.
	 */
	navigateToPrivacy() {
		this.router.navigate(["privacy-policy"]);
	}

	/**
	 * Signs the user out of the application.
	 * Triggered by user interaction with the logout button in the header.
	 */
	onLogout() {
		this.authService.signOut();
	}
}
