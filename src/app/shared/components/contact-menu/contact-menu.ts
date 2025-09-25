import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	HostListener,
	ElementRef,
	inject,
} from "@angular/core";
import { Button } from "@shared/components/button/button";

/**
 * Animated dropdown menu component for contact actions (edit/delete).
 *
 * This component provides a smooth animated menu with sophisticated state management:
 * - **Three-phase animation** using multiple signals for smooth transitions
 * - **Click-outside detection** for intuitive UX
 * - **Keyboard accessibility** with Escape key support
 * - **Event delegation** for edit and delete actions
 * - **Automatic cleanup** to prevent memory leaks
 *
 * Animation States:
 * - `isMenuOpen`: Controls menu presence in DOM
 * - `isMenuVisible`: Triggers slide-in/out CSS transitions
 * - `isMenuHiding`: Manages intermediate animation state
 *
 * Animation Sequence:
 * **Open**: isMenuOpen → delay(10ms) → isMenuVisible (slide-in)
 * **Close**: isMenuVisible=false → wait(300ms) → isMenuOpen=false
 *
 * Event Handling:
 * - Click outside menu → closes menu
 * - Escape key → closes menu
 * - Action selection → emits event + closes menu
 *
 * @example
 * ```html
 * <app-contact-menu
 *   [contactId]="contact.id"
 *   (editClicked)="onEditContact($event)"
 *   (deleteClicked)="onDeleteContact($event)">
 * </app-contact-menu>
 * ```
 */
@Component({
	selector: "app-contact-menu",
	imports: [Button],
	templateUrl: "./contact-menu.html",
	styleUrl: "./contact-menu.scss",
})
export class ContactMenu {
	/** ID of the contact this menu applies to */
	@Input() contactId?: string;

	/** Emitted when user selects edit action */
	@Output() editClicked = new EventEmitter<string>();

	/** Emitted when user selects delete action */
	@Output() deleteClicked = new EventEmitter<string>();

	/** Signal controlling menu presence in DOM (true = menu exists) */
	public isMenuOpen = signal(false);

	/** Signal triggering slide-in/out CSS transitions (true = visible) */
	public isMenuVisible = signal(false);

	/** Signal managing intermediate closing animation state */
	public isMenuHiding = signal(false);

	/** ElementRef for detecting clicks outside the menu component */
	private elementRef = inject(ElementRef);

	/** Timeout ID for animation cleanup and memory leak prevention */
	private hideTimeout?: number;

	/**
	 * Toggles menu visibility with smooth animation.
	 * Switches between open and closed states using appropriate animation sequence.
	 *
	 * @example
	 * ```html
	 * <!-- Called from menu trigger button -->
	 * <button (click)="toggleMenu()">⋮</button>
	 * ```
	 */
	toggleMenu(): void {
		if (this.isMenuOpen()) {
			this.closeMenu();
		} else {
			this.openMenu();
		}
	}

	/**
	 * Opens the menu with smooth slide-in animation.
	 *
	 * Animation Sequence:
	 * 1. **Clear Timeouts**: Cancels any pending close animations
	 * 2. **Show in DOM**: Sets isMenuOpen = true (menu appears)
	 * 3. **Reset State**: Sets isMenuHiding = false
	 * 4. **Trigger Animation**: After 10ms delay, sets isMenuVisible = true
	 *
	 * The 10ms delay ensures CSS transitions work properly by allowing
	 * the browser to render the initial state before triggering the transition.
	 *
	 * @example
	 * ```typescript
	 * // Called automatically from toggleMenu() when menu is closed
	 * this.openMenu(); // Smooth slide-in animation starts
	 * ```
	 */
	private openMenu(): void {
		// Clear any pending hide timeout
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = undefined;
		}

		this.isMenuOpen.set(true);
		this.isMenuHiding.set(false);

		// Start slide-in animation immediately
		setTimeout(() => {
			this.isMenuVisible.set(true);
		}, 10); // Small delay to ensure CSS transition works
	}

	/**
	 * Closes the menu with smooth slide-out animation.
	 *
	 * Animation Sequence:
	 * 1. **Hide Visual**: Sets isMenuVisible = false (triggers slide-out)
	 * 2. **Mark Hiding**: Sets isMenuHiding = true (intermediate state)
	 * 3. **Wait for Animation**: 300ms timeout matches CSS transition duration
	 * 4. **Remove from DOM**: Sets isMenuOpen = false (menu disappears)
	 * 5. **Reset State**: Sets isMenuHiding = false, clears timeout
	 *
	 * The 300ms timeout ensures the slide-out animation completes before
	 * removing the menu from the DOM for smooth UX.
	 *
	 * @example
	 * ```typescript
	 * // Called from various triggers
	 * this.closeMenu(); // Smooth slide-out animation starts
	 * ```
	 */
	private closeMenu(): void {
		this.isMenuVisible.set(false);
		this.isMenuHiding.set(true);

		// Wait for animation to complete before updating menu state
		this.hideTimeout = setTimeout(() => {
			this.isMenuOpen.set(false);
			this.isMenuHiding.set(false);
			this.hideTimeout = undefined;
		}, 300); // Match CSS transition duration
	}

	/**
	 * Handles edit action selection.
	 * Emits edit event and closes menu with animation.
	 *
	 * @example
	 * ```html
	 * <!-- Called from edit menu item -->
	 * <button (click)="onEdit()">Edit Contact</button>
	 * ```
	 */
	onEdit(): void {
		if (this.contactId) {
			this.editClicked.emit(this.contactId);
			this.closeMenu(); // Close menu with animation after action
		}
	}

	/**
	 * Handles delete action selection.
	 * Emits delete event and closes menu with animation.
	 *
	 * @example
	 * ```html
	 * <!-- Called from delete menu item -->
	 * <button (click)="onDelete()">Delete Contact</button>
	 * ```
	 */
	onDelete(): void {
		if (this.contactId) {
			this.deleteClicked.emit(this.contactId);
			this.closeMenu(); // Close menu with animation after action
		}
	}

	/**
	 * Handles click-outside detection for intuitive menu closing.
	 * Listens to document clicks and closes menu if click occurs outside component.
	 *
	 * Click Detection Logic:
	 * 1. **Menu Open Check**: Only processes clicks when menu is open
	 * 2. **Target Analysis**: Gets the clicked element from event
	 * 3. **Boundary Check**: Uses ElementRef to check if click is outside
	 * 4. **Auto-Close**: Triggers animated close if click is external
	 *
	 * @param event - DOM click event from anywhere in the document
	 *
	 * @example
	 * ```typescript
	 * // Automatically called by Angular when document is clicked
	 * // User clicks outside menu → menu closes with animation
	 * ```
	 */
	@HostListener("document:click", ["$event"])
	onDocumentClick(event: Event): void {
		if (this.isMenuOpen()) {
			const target = event.target as Element;
			// Check if click is outside this component
			if (!this.elementRef.nativeElement.contains(target)) {
				this.closeMenu();
			}
		}
	}

	/**
	 * Handles Escape key for keyboard accessibility.
	 * Provides standard keyboard navigation by closing menu on Escape.
	 *
	 * Accessibility Benefits:
	 * - **WCAG Compliance**: Standard keyboard navigation pattern
	 * - **User Expectation**: Escape key universally closes overlays
	 * - **Smooth Animation**: Uses same animated close as other triggers
	 *
	 * @example
	 * ```typescript
	 * // Automatically called by Angular when Escape is pressed
	 * // User presses Escape → menu closes with animation
	 * ```
	 */
	@HostListener("document:keydown.escape")
	onEscapeKey(): void {
		if (this.isMenuOpen()) {
			this.closeMenu();
		}
	}
}
