import { SlicePipe } from "@angular/common";
import { Component, input } from "@angular/core";
import { Contact } from "@core/interfaces/contact";
import { ProfilePicture } from "@shared/components/profile-picture/profile-picture";

/**
 * A component that renders a list of assigned contacts.
 *
 * @remarks
 * Expects an array of contacts via `assigned`, and a size option via `size`.
 */
@Component({
	selector: "app-assigned-list",
	imports: [ProfilePicture, SlicePipe],
	templateUrl: "./assigned-list.html",
	styleUrl: "./assigned-list.scss",
})
export class AssignedList {
	/**
	 * The contacts that are assigned and should be shown in the list.
	 */
	assigned = input.required<Contact[]>();

	/**
	 * Defines the font-size of the component (e.g., large, medium or small).
	 */
	size = input<"big" | "medium" | "small">("medium");
}
