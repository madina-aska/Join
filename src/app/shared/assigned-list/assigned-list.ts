import { SlicePipe } from "@angular/common";
import { Component, input } from "@angular/core";
import { Contact } from "@core/interfaces/contact";
import { ProfilePicture } from "@shared/components/profile-picture/profile-picture";

@Component({
	selector: "app-assigned-list",
	imports: [ProfilePicture, SlicePipe],
	templateUrl: "./assigned-list.html",
	styleUrl: "./assigned-list.scss",
})
export class AssignedList {
	assigned = input.required<Contact[]>();
	size = input<"big" | "medium" | "small">("medium");
}
