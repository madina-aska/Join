import { Component, OnInit } from "@angular/core";
import { Greeting } from "./greeting/greeting";
import { Dashboard } from "./dashboard/dashboard";

@Component({
	selector: "app-summary",
	imports: [Greeting, Dashboard],
	templateUrl: "./summary.html",
	styleUrl: "./summary.scss",
})
export class Summary implements OnInit {
	showGreeting = true;
	userName = "Madina Aska"; // temporary placeholder name

	ngOnInit() {
		// show greeting for 2.5 seconds, then show dashboard
		setTimeout(() => (this.showGreeting = false), 2500);
	}
}
