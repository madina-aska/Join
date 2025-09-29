import { Component, input } from "@angular/core";
import { AvatarColor } from "@core/directives/avatar-color";
import { Contact } from "@core/interfaces/contact";

@Component({
	selector: "app-profile-picture",
	imports: [AvatarColor],
	templateUrl: "./profile-picture.html",
	styleUrl: "./profile-picture.scss",
})
export class ProfilePicture {
	contact = input.required<Contact>();
	size = input<"big" | "medium" | "small">("medium");
}
