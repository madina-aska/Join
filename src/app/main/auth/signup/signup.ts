import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import {
	AbstractControl,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	ValidatorFn,
	Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { ToastService } from "@shared/services/toast.service";

@Component({
	selector: "app-signup",
	imports: [RouterLink, ReactiveFormsModule, CommonModule],
	templateUrl: "./signup.html",
	styleUrl: "./signup.scss",
})
export class Signup {
	private authService = inject(AuthService);
	private router = inject(Router);
	private toastService = inject(ToastService);

	errorMessage: string | null = null;
	isLoading: boolean = false;

	/**
	 * Custom Validator, der prüft, ob Passwort und Bestätigung übereinstimmen.
	 */
	passwordMatchValidator: ValidatorFn = (group: AbstractControl): { [key: string]: any } | null => {
		// Sicherer Zugriff auf die Controls
		const password = group.get("password")?.value;
		const confirmPassword = group.get("confirmPassword")?.value;

		if (!password || !confirmPassword) {
			return null;
		}

		// Gibt null zurück, wenn valid (Passwörter stimmen überein), sonst das Fehlerobjekt.
		// TypeScript-Fehler: 'passwordMismatch' ist der Schlüssel, der im Template verwendet wird
		return password === confirmPassword ? null : { passwordMismatch: true };
	};

	/**
	 * Formulargruppe definieren mit allen Feldern
	 */
	signupForm = new FormGroup(
		{
			name: new FormControl("", [Validators.required, Validators.minLength(3)]),
			email: new FormControl("", [Validators.required, Validators.email]),
			// Das Passwort braucht mindestens 8 Zeichen
			password: new FormControl("", [Validators.required, Validators.minLength(8)]),
			confirmPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
			acceptedPolicy: new FormControl(false, [Validators.requiredTrue]),
		},
		// Gruppen-Validator für Passwort-Gleichheit
		{ validators: this.passwordMatchValidator },
	);

	/**
	 * Registriert den Benutzer mithilfe des AuthService.
	 */
	onSignUp(): void {
		this.errorMessage = null;

		// Markiere alle Felder als touched, um Fehlermeldungen anzuzeigen
		this.signupForm.markAllAsTouched();

		if (this.signupForm.invalid) {
			this.toastService.showError(
				"Validation Error",
				"Please check all input fields and accept the privacy policy.",
			);
			return;
		}

		// Sicherheitshalber Typ-Assertion bei Formularwerten, nachdem die Validierung bestanden wurde
		const email = this.signupForm.value.email as string;
		const password = this.signupForm.value.password as string;
		const name = this.signupForm.value.name as string;

		// Da die Validierung bestanden wurde, sollten email, password und name definiert sein
		if (email && password && name) {
			this.isLoading = true;

			this.authService.signUp(email, password, name).subscribe({
				error: (error) => {
					this.isLoading = false;
					// Prüfen auf spezifische Firebase-Fehler (z.B. E-Mail bereits verwendet)
					const code = error.code;
					if (code === "auth/email-already-in-use") {
						this.errorMessage = "This email address is already in use. Please log in.";
					} else {
						// Zeige den allgemeinen Fehler an
						this.errorMessage = "Registration failed. Please try again.";
						console.error("Registration error:", error);
					}
					this.toastService.showError("Registration error", this.errorMessage);
				},
				complete: () => {
					this.isLoading = false;
					this.toastService.showSuccess(
						"Success",
						"Registration successful. You will be redirected.",
					);
					this.router.navigate(["/"]);
				},
			});
		}
	}
}
