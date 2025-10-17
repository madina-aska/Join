import { Location } from "@angular/common";
import { Component, inject } from "@angular/core";

@Component({
	selector: "app-privacy-policy",
	imports: [],
	templateUrl: "./privacy-policy.html",
	styleUrl: "./privacy-policy.scss",
})
export class PrivacyPolicy {
	location = inject(Location);
}
