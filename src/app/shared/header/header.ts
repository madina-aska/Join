import { Component, inject, input } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { PopoverButtonDirective } from "@core/directives/popover-button-directive";
import { PopoverDirective } from "@core/directives/popover-directive";
import { Contact } from "@core/interfaces/contact";
import { Popover } from "@shared/components/popover/popover";
import { AuthService } from "@core/services/auth-service";

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
	imports: [PopoverButtonDirective, Popover, PopoverDirective, RouterLink],
	templateUrl: "./header.html",
	styleUrl: "./header.scss",
})
export class Header {
	/** Optional user profile information for display in header */
	profile = input<Contact>();
	loggedIn = input<boolean>(false);
	router = inject(Router);
  authService = inject(AuthService);

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
