import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
// import { collection, Firestore, onSnapshot } from "@angular/fire/firestore";
import { Footer } from "./shared/footer/footer";
import { Header } from "./shared/header/header";
import { Sidebar } from "./shared/sidebar/sidebar";
import { AddContact } from "./main/contacts/add-contact/add-contact";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, Sidebar, Header, Footer, AddContact],
	templateUrl: "./app.html",
	styleUrl: "./app.scss",
})
export class App {
	protected readonly title = signal("join");

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
