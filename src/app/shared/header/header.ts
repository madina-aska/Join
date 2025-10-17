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
 * Application header component for branding and user profile display.
 *
 * This component provides the top navigation bar with:
 * - **Application Branding**: Logo and app name display
 * - **User Profile Integration**: Optional contact profile display
 * - **Modern Signal API**: Uses Angular's latest input signals
 * - **Responsive Design**: Adaptive layout for mobile and desktop
 *
 * Profile Integration:
 * - Accepts optional Contact object for user profile
 * - Displays user name and avatar when available
 * - Gracefully handles undefined profile state
 * - Uses Contact interface for type safety
 *
 * Design Features:
 * - Clean, minimal header design
 * - Consistent with application theme
 * - Mobile-responsive layout
 * - Accessibility-compliant structure
 *
 * @example
 * ```html
 * <!-- Header without profile -->
 * <app-header></app-header>
 *
 * <!-- Header with user profile -->
 * <app-header [profile]="currentUser"></app-header>
 *
 * <!-- Profile object structure -->
 * const userProfile: Contact = {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   initials: 'JD',
 *   color: 3
 * };
 * ```
 */
@Component({
	selector: "app-header",
	imports: [PopoverButtonDirective, Popover, PopoverDirective, RouterLink, ProfilePicture],
	templateUrl: "./header.html",
	styleUrl: "./header.scss",
})
export class Header {
	/** Optional user profile information for display in header */
	profile = input<Contact>();
	loggedIn = input<boolean>(false);
	router = inject(Router);
	authService = inject(AuthService);
	contactService = inject(ContactService);
	currentUser = null;
	userAsContact: Contact | undefined;

	constructor() {
		this.authService.firebaseUser$.subscribe((user) => {
			if (!user?.email) return;
			const userAsContact$ = this.contactService.getContactByEmail(user?.email || "");
			userAsContact$.forEach((contact) => {
				this.userAsContact = contact;
			});
		});
	}

	navigateToLegal() {
		this.router.navigate(["legal-notice"]);
	}

	navigateToPrivacy() {
		this.router.navigate(["privacy-policy"]);
	}

	onLogout() {
		this.authService.signOut();
	}
}
