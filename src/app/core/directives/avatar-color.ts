import { Directive, ElementRef, inject, input, OnInit } from "@angular/core";
import { Contact } from "@core/interfaces/contact";
import { ContactService } from "@core/services/contact-service";

@Directive({
	selector: "[appAvatarColorFromContact]",
})
export class AvatarColor implements OnInit {
	private el = inject(ElementRef);
	private contactService = inject(ContactService);
	appAvatarColorFromContact = input<Contact>();

	ngOnInit() {
		this.el.nativeElement.style.backgroundColor = this.contactService.getAvatarColor(
			this.appAvatarColorFromContact()!,
		);
	}
}
