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
				"Fehler",
				"Bitte geben Sie eine gültige E-Mail und ein Passwort (min. 6 Zeichen) ein.",
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
						this.errorMessage = "Ungültige Anmeldedaten. Bitte prüfen Sie E-Mail und Passwort.";
					} else {
						this.errorMessage =
							"Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
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
				this.errorMessage = "Fehler beim Gast-Login.";
				this.toastService.showError("Gast-Login-Fehler", "Der anonyme Login ist fehlgeschlagen.");
			},
			complete: () => {
				this.isLoading = false;
			},
		});
	}
}
