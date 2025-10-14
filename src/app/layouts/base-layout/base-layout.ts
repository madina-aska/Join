import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { Footer } from "@shared/footer/footer";
import { Header } from "@shared/header/header";

@Component({
	selector: "app-base-layout",
	imports: [Header, RouterOutlet, Footer],
	templateUrl: "./base-layout.html",
	styleUrl: "./base-layout.scss",
})
export class BaseLayout implements OnInit {
	private authService = inject(AuthService);
	loggedIn = false;

	ngOnInit() {
		this.loggedIn = true;
	}
}
