import { Component } from "@angular/core";
import { Greeting } from "@main/summary/greeting/greeting";
import { Dashboard } from "@main/summary/dashboard/dashboard";

@Component({
	selector: "app-summary",
	imports: [Greeting, Dashboard],
	templateUrl: "./summary.html",
	styleUrl: "./summary.scss",
})
export class Summary {}
