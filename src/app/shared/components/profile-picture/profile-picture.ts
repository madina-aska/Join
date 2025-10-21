import { Component, input } from "@angular/core";
import { AvatarColor } from "@core/directives/avatar-color";
import { Contact } from "@core/interfaces/contact";

/**
 * Displays a user avatar based on the provided contact's initials.
 *
 * @example
 * ```html
 * <app-profile-picture [contact]="currentUser"></app-profile-picture>
 * ```
 */
@Component({
	selector: "app-profile-picture",
	imports: [AvatarColor],
	templateUrl: "./profile-picture.html",
	styleUrls: ["./profile-picture.scss"],
})
export class ProfilePicture {
	/** Required contact information for generating the avatar */
	contact = input.required<Contact>();

	/** Defines the font-size of the avatars initials */
	size = input<"big" | "medium" | "header" | "small">("medium");
}
