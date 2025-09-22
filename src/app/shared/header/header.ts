import { Component, input } from "@angular/core";
import { Contact } from "app/core/interfaces/contact";

@Component({
	selector: "app-header",
	imports: [],
	templateUrl: "./header.html",
	styleUrl: "./header.scss",
})
export class Header {
	profile = input<Contact>();
}
