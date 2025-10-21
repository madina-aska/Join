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
	/** Injected authentication service */
	private authService = inject(AuthService);

	/** Injected router for navigation */
	private router = inject(Router);

	/** Injected toast service for notifications */
	private toastService = inject(ToastService);

	/** Error message displayed on signup failure */
	errorMessage: string | null = null;

	/** Indicates whether a signup request is in progress */
	isLoading: boolean = false;

	/**
	 * Validator to check if password and confirmPassword fields match.
	 * @param group - The form group containing password fields.
	 * @returns Validation error object or null.
	 */
	passwordMatchValidator: ValidatorFn = (group: AbstractControl): { [key: string]: any } | null => {
		const password = group.get("password")?.value;
		const confirmPassword = group.get("confirmPassword")?.value;

		if (!password || !confirmPassword) {
			return null;
		}
		return password === confirmPassword ? null : { passwordMismatch: true };
	};

	/** Reactive signup form with validation rules */
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
	 * Handles the signup process using the AuthService.
	 * Validates the form and triggers registration.
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

	/**
	 * Checks if the signup form is invalid.
	 * @returns True if invalid, false otherwise.
	 */
	private isFormInvalid(): boolean {
		return this.signupForm.invalid;
	}

	/**
	 * Displays a toast message for form validation errors.
	 */
	private showValidationError(): void {
		this.toastService.showError(
			"Validation Error",
			"Please check all input fields and accept the privacy policy.",
		);
	}

	/**
	 * Executes the signup request via AuthService.
	 * @param email - User's email address.
	 * @param password - User's password.
	 * @param name - User's display name.
	 */
	private executeSignUp(email: string, password: string, name: string): void {
		this.isLoading = true;
		this.authService.signUp(email, password, name).subscribe({
			error: (error) => this.handleSignUpError(error),
			complete: () => this.handleSignUpSuccess(),
		});
	}

	/**
	 * Handles signup errors and displays appropriate messages.
	 * @param error - Error object returned from AuthService.
	 */
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

	/**
	 * Handles successful signup and redirects the user.
	 */
	private handleSignUpSuccess(): void {
		this.isLoading = false;
		this.toastService.showSuccess("Success", "Registration successful. You will be redirected.");
		this.router.navigate(["/"]);
	}
}
