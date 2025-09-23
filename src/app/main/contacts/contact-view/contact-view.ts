import { Component, inject, input, OnChanges } from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { ActivatedRoute, Router } from "@angular/router";
import { ContactService } from "app/core/services/contact-service";

@Component({
	selector: "app-contact-view",
	templateUrl: "./contact-view.html",
	styleUrls: ["./contact-view.scss"],
})
export class ContactView implements OnChanges {
	firestore = inject(Firestore);
	contactService = inject(ContactService);
	route = inject(ActivatedRoute);
	router = inject(Router);
	id = input<string>("");

	ngOnChanges() {
		if (this.id()) {
			this.contactService.getDocumentById(this.id());
		} else {
			this.contactService.contactForView = undefined;
		}
	}

	goBack() {
		this.router.navigate(["/contacts"]);
	}
}
