import { Directive, ElementRef, inject, input, OnInit } from "@angular/core";
import { Contact } from "@core/interfaces/contact";
import { ContactService } from "@core/services/contact-service";

/**
 * Directive that sets the background color of an avatar element
 * based on a Contact object.
 *
 * It uses the `ContactService.getAvatarColor` method to determine
 * the appropriate color for the contact and applies it to the
 * host element's background.
 *
 * ### Usage
 * ```html
 * <div [appAvatarColorFromContact]="contact"></div>
 * ```
 *
 * @example
 * <div [appAvatarColorFromContact]="selectedContact"></div>
 */
@Directive({
	selector: "[appAvatarColorFromContact]",
})
export class AvatarColor implements OnInit {
	/**
	 * The element reference of the host element where the directive is applied.
	 * @private
	 */
	private el = inject(ElementRef);

	/**
	 * Service to fetch the avatar color for a contact.
	 * @private
	 */
	private contactService = inject(ContactService);

	/**
	 * The Contact object used to determine the avatar color.
	 * This is passed as an input from the parent component.
	 */
	appAvatarColorFromContact = input<Contact>();

	/**
	 * Lifecycle hook called when the directive is initialized.
	 * Sets the background color of the host element based on the contact.
	 */
	ngOnInit() {
		this.el.nativeElement.style.backgroundColor = this.contactService.getAvatarColor(
			this.appAvatarColorFromContact()!,
		);
	}
}
