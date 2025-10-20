import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { AuthService } from "@core/services/auth-service";

@Component({
	selector: "app-greeting",
	imports: [CommonModule],
	templateUrl: "./greeting.html",
	styleUrl: "./greeting.scss",
})
export class Greeting {
	authService = inject(AuthService);
	userName = signal<string>("");

	hour = new Date().getHours();
	greeting = this.hour < 12 ? "Good morning" : this.hour < 18 ? "Good afternoon" : "Good evening";

	constructor() {
		this.authService.userLoggedIn$.subscribe((user) => {
			this.userName.set(user?.displayName || "Guest");
		});
	}
}
