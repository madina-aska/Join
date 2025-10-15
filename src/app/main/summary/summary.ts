import { Component, signal } from "@angular/core";
import { Greeting } from "./greeting/greeting";
import { Dashboard } from "./dashboard/dashboard";

@Component({
	selector: "app-summary",
	imports: [Greeting, Dashboard],
	templateUrl: "./summary.html",
	styleUrl: "./summary.scss",
})
export class Summary {
	showGreeting = signal(true);
	userName = "User";

	toggleGreeting() {
		this.showGreeting.set(!this.showGreeting());
	}
}
