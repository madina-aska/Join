import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
// import { collection, Firestore, onSnapshot } from "@angular/fire/firestore";
import { AddContact } from "./main/contacts/add-contact/add-contact";
import { Toast } from "./shared/components/toast/toast";
import { Footer } from "./shared/footer/footer";
import { Header } from "./shared/header/header";
import { ToastService } from "./shared/services/toast.service";
import { Sidebar } from "./shared/sidebar/sidebar";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, Sidebar, Header, Footer, AddContact, Toast],
	templateUrl: "./app.html",
	styleUrl: "./app.scss",
})
export class App {
	protected readonly title = signal("join");
	protected toastService = inject(ToastService);

	// Signal for current toast
	protected currentToast = this.toastService.toast;

	//  db = inject(Firestore);

	constructor() {
		// const items = collection(this.db, "contacts");
		// const snapshots = onSnapshot(items, (contact) => {
		// 	contact.forEach((contacts) => {
		// 		console.log(contacts.data());
		// 	});
		// });
		// console.log(items);
	}
}
