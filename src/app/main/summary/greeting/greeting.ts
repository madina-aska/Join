import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-greeting",
	imports: [CommonModule],
	templateUrl: "./greeting.html",
	styleUrl: "./greeting.scss",
})
export class Greeting implements OnInit {
	@Input() userName: string = "User";
	greeting: string = "";

	ngOnInit(): void {
		const hour = new Date().getHours();

		if (hour < 12) this.greeting = "Good morning";
		else if (hour < 18) this.greeting = "Good afternoon";
		else this.greeting = "Good evening";
	}
}
