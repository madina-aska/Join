import { Component, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { AuthService } from "@core/services/auth-service";
import { ToastService } from "@shared/services/toast.service";
import { CommonModule } from "@angular/common";

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
        "Validierungsfehler",
        "Bitte überprüfen Sie alle Eingabefelder und akzeptieren Sie die Datenschutzrichtlinie.",
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
            this.errorMessage =
              "Diese E-Mail-Adresse wird bereits verwendet. Bitte logge dich ein.";
          } else {
            // Zeige den allgemeinen Fehler an
            this.errorMessage = "Registrierung fehlgeschlagen. Bitte versuche es erneut.";
            console.error("Registrierungsfehler:", error);
          }
          this.toastService.showError("Registrierungsfehler", this.errorMessage);
        },
        complete: () => {
          this.isLoading = false;
          this.toastService.showSuccess("Erfolg", "Registrierung erfolgreich. Du wirst weitergeleitet.");
          // this.router.navigate(['/dashboard']);
        },
      });
    }
  }
}
