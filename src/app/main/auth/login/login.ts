import { Component, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "@core/services/auth-service";
import { ToastService } from "@shared/services/toast.service";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-login",
	imports: [ReactiveFormsModule, RouterLink, CommonModule],
	templateUrl: "./login.html",
	styleUrls: ["./login.scss"],
})
export class Login {
	private authService = inject(AuthService);
	private router = inject(Router);
	private toastService = inject(ToastService);

	errorMessage: string | null = null;
	isLoading: boolean = false;

	loginForm = new FormGroup({
		email: new FormControl("", [Validators.required, Validators.email]),
		password: new FormControl("", [Validators.required, Validators.minLength(6)]),
	});

	constructor() {
		this.authService.isLoggedInOnce().subscribe((isLoggedIn) => {
			if (isLoggedIn) {
				this.router.navigate(["summary"]);
			}
		});
	}

	/**
	 * Meldet den Benutzer mit E-Mail und Passwort an.
	 */
	onLogin(): void {
		this.errorMessage = null;

		if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
			this.toastService.showError(
				"Error", "Please enter a valid email and a password (min. 6 characters).",
			);
			return;
		}

		const { email, password } = this.loginForm.value;

		if (email && password) {
			this.isLoading = true;

			this.authService.signIn(email, password).subscribe({
				error: (error) => {
					this.isLoading = false;
					const code = error.code;
					if (
						code === "auth/invalid-credential" ||
						code === "auth/user-not-found" ||
						code === "auth/wrong-password"
					) {
						this.errorMessage = "Invalid login details. Please check email and password.";
					} else {
						this.errorMessage =
							"An unexpected error occurred. Please try again later.";
					}
					this.toastService.showError("Login-Fehler", this.errorMessage);
				},
				complete: () => {
					this.isLoading = false;
				},
			});
		}
	}

	/**
	 * Meldet den Benutzer anonym als Gast an.
	 */
	onGuestLogin(): void {
		this.errorMessage = null;
		this.isLoading = true;

		this.authService.signInAsGuest().subscribe({
			error: (error) => {
				this.isLoading = false;
				this.errorMessage = "Error with guest login.";
				this.toastService.showError("Guest Login Error", "The anonymous login failed.");
			},
			complete: () => {
				this.isLoading = false;
			},
		});
	}
}
