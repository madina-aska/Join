import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

@Component({
	selector: "app-signup",
	imports: [RouterLink, FormsModule],
	templateUrl: "./signup.html",
	styleUrl: "./signup.scss",
})
export class Signup {
	name: string = "";
	email: string = "";
	password: string = "";
	confirmPassword: string = "";
	acceptedPolicy: boolean = false;

	constructor(private router: Router) {}

	isFormValid(): boolean {
		return (
			this.name.trim().length > 2 &&
			this.email.trim().length > 4 &&
			this.password.length > 8 &&
			this.confirmPassword.length > 8 &&
			this.acceptedPolicy
		);
	}

	navigateToSummary() {
		if (this.acceptedPolicy) {
			this.router.navigate(["/summary"]);
		}
	}
}
