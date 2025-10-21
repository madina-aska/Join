import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { ToastService } from "@shared/services/toast.service";

@Component({
	selector: "app-login",
	imports: [ReactiveFormsModule, RouterLink, CommonModule],
	templateUrl: "./login.html",
	styleUrls: ["./login.scss"],
})
export class Login {
	/** Injected authentication service */
	private authService = inject(AuthService);

	/** Injected router for navigation */
	private router = inject(Router);

	/** Injected toast service for notifications */
	private toastService = inject(ToastService);

	/** Error message displayed on login failure */
	errorMessage: string | null = null;

	/** Indicates whether a login request is in progress */
	isLoading: boolean = false;

	/** Reactive login form with email and password fields */
	loginForm = new FormGroup({
		email: new FormControl("", [Validators.required, Validators.email]),
		password: new FormControl("", [Validators.required, Validators.minLength(6)]),
	});

	/**
	 * Initializes the component and redirects if the user is already logged in.
	 */
	constructor() {
		this.authService.isLoggedInOnce().subscribe((isLoggedIn) => {
			if (isLoggedIn) {
				this.router.navigate(["summary"]);
			}
		});
	}

	/**
	 * Attempts to log in the user using email and password.
	 * Displays error messages and handles loading state.
	 */
	onLogin(): void {
		this.errorMessage = null;

		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			this.toastService.showError(
				"Error",
				"Please enter a valid email and a password (min. 6 characters).",
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
						this.errorMessage = "An unexpected error occurred. Please try again later.";
					}
					this.toastService.showError("Login Error", this.errorMessage);
				},
				complete: () => {
					this.isLoading = false;
				},
			});
		}
	}

	/**
	 * Logs in the user anonymously as a guest.
	 * Displays error messages and handles loading state.
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
