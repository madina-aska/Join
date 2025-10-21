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

	passwordMatchValidator: ValidatorFn = (group: AbstractControl): { [key: string]: any } | null => {
		const password = group.get("password")?.value;
		const confirmPassword = group.get("confirmPassword")?.value;

		if (!password || !confirmPassword) {
			return null;
		}
		return password === confirmPassword ? null : { passwordMismatch: true };
	};

	signupForm = new FormGroup(
		{
			name: new FormControl("", [Validators.required, Validators.minLength(3)]),
			email: new FormControl("", [Validators.required, Validators.email]),
			password: new FormControl("", [Validators.required, Validators.minLength(8)]),
			confirmPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
			acceptedPolicy: new FormControl(false, [Validators.requiredTrue]),
		},
		{ validators: this.passwordMatchValidator },
	);

	/**
	 * Registriert den Benutzer mithilfe des AuthService.
	 */
	onSignUp(): void {
		this.errorMessage = null;
		this.signupForm.markAllAsTouched();

		if (this.isFormInvalid()) {
			this.showValidationError();
			return;
		}

		const { email, password, name } = this.signupForm.value;
		this.executeSignUp(email as string, password as string, name as string);
	}

	private isFormInvalid(): boolean {
		return this.signupForm.invalid;
	}

	private showValidationError(): void {
		this.toastService.showError(
			"Validation Error",
			"Please check all input fields and accept the privacy policy.",
		);
	}

	private executeSignUp(email: string, password: string, name: string): void {
		this.isLoading = true;
		this.authService.signUp(email, password, name).subscribe({
			error: (error) => this.handleSignUpError(error),
			complete: () => this.handleSignUpSuccess(),
		});
	}

	private handleSignUpError(error: any): void {
		this.isLoading = false;
		const code = error.code;
		if (code === "auth/email-already-in-use") {
			this.errorMessage = "This email address is already in use. Please log in.";
		} else {
			this.errorMessage = "Registration failed. Please try again.";
			console.error("Registration error:", error);
		}
		this.toastService.showError("Registration error", this.errorMessage);
	}

	private handleSignUpSuccess(): void {
		this.isLoading = false;
		this.toastService.showSuccess("Success", "Registration successful. You will be redirected.");
		this.router.navigate(["/"]);
	}
}
