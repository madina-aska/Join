import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { doc, Firestore, updateDoc, addDoc, collection, getDoc } from "@angular/fire/firestore";
import { Contact } from "@core/interfaces/contact";
import { ToastService } from "@shared/services/toast.service";
import { ContactService } from "@core/services/contact-service";

/**
 * Component for editing existing contacts or creating new ones.
 *
 * This component provides a dual-mode interface that can either:
 * - Edit an existing contact when provided with a contactId
 * - Create a new contact when no contactId is provided
 *
 * Features:
 * - Reactive form with validation for name, email, and phone
 * - Auto-detection of edit vs. create mode
 * - Real-time data loading from Firestore
 * - Form validation with German umlaut support
 * - Error handling with toast notifications
 * - Automatic initials generation
 *
 * Form Validation:
 * - Name: Requires first and last name, supports German umlauts
 * - Email: Standard email validation with custom pattern
 * - Phone: International phone number format (+, numbers, spaces, dashes)
 *
 * @example
 * ```html
 * <!-- Edit existing contact -->
 * <app-edit-contact
 *   [contactId]="selectedContactId"
 *   (closed)="onEditClosed()"
 *   (saved)="onContactSaved()">
 * </app-edit-contact>
 *
 * <!-- Create new contact -->
 * <app-edit-contact
 *   [contactId]="null"
 *   (closed)="onCreateClosed()"
 *   (saved)="onContactCreated()">
 * </app-edit-contact>
 * ```
 */
@Component({
  selector: "app-edit-contact",
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: "./edit-contact.html",
  styleUrl: "./edit-contact.scss",
})
export class EditContact implements OnInit {
  /** Firestore document ID of the contact to edit. Null for creating new contacts. */
  @Input() contactId: string | null = null;

  /** Emitted when the edit overlay is closed without saving */
  @Output() closed = new EventEmitter<void>();

  /** Emitted when contact is successfully saved (created or updated) */
  @Output() saved = new EventEmitter<void>();

  /** Injected Firestore service for database operations */
  private firestore = inject(Firestore);

  /** Injected form builder for reactive forms */
  private fb = inject(FormBuilder);

  /** Injected toast service for user notifications */
  private toastService = inject(ToastService);

  /** Injected contact service for contact operations */
  private contactService = inject(ContactService);

  /** Reactive form group with validation for contact editing/creation */
  contactForm: FormGroup;

  /** Flag indicating whether component is in edit mode (true) or create mode (false) */
  isEdit = false;
  contactService = inject(ContactService);
  contact!: Contact;

  /**
   * Initializes the component with a reactive form containing validation rules.
   * Sets up form fields for name, email, and phone with German umlaut support.
   */
  constructor() {
    this.contactForm = this.fb.group({
      name: [
        "",
        [Validators.required, Validators.pattern(/^[A-ZÄÖÜa-zäöüß]+(?:\s[A-ZÄÖÜa-zäöüß]+)+$/)],
      ],
      email: [
        "",
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      phone: ["", [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
    });
  }

  /**
   * Angular lifecycle hook that initializes the component.
   * Determines if component is in edit or create mode and loads data if editing.
   *
   * @example
   * ```typescript
   * // Automatically called by Angular
   * // Sets isEdit = true if contactId is provided
   * // Loads existing contact data for editing
   * ```
   */
  ngOnInit() {
    this.isEdit = !!this.contactId;
    if (this.isEdit) {
      this.loadContactData();
    }
  }

  /**
   * Loads existing contact data from Firestore for editing.
   * Fetches contact document by ID and populates the form fields.
   * Closes overlay if contact is not found.
   *
   * @returns Promise that resolves when contact data is loaded
   * @throws Error if Firestore operation fails
   *
   * @example
   * ```typescript
   * // Called automatically in ngOnInit when editing
   * await this.loadContactData();
   * // Form is populated with existing contact data
   * ```
   */
  async loadContactData() {
    if (!this.contactId) return;

    const docRef = doc(this.firestore, "contacts", this.contactId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as Contact;
      this.contact = data;
      this.contactForm.patchValue({
        name: data.name,
        email: data.email,
        phone: data.telephone,

      });
    } else {
      this.closeOverlay();
    }
  }

  /**
   * Handles form submission for both editing existing contacts and creating new ones.
   * Validates form, generates initials, and either updates or creates contact in Firestore.
   * Emits appropriate events and shows toast notifications.
   *
   * Process flow:
   * 1. Validates form data
   * 2. Generates initials from name
   * 3. Updates existing contact OR creates new contact based on isEdit flag
   * 4. Emits saved event on success
   * 5. Shows error toast on failure
   * 6. Closes overlay after successful operation
   *
   * @returns Promise that resolves when operation completes
   * @throws Error if Firestore operation fails
   *
   * @example
   * ```typescript
   * // Called from template on form submit
   * await this.onSubmit();
   * // Contact is saved and overlay closes
   * ```
   */
  async onSubmit() {
    if (this.contactForm.invalid) return;

    const values = this.contactForm.value;
    const initials = this.getInitials(values.name);

    try {
      if (this.isEdit && this.contactId) {
        // Kontakt updaten
        const docRef = doc(this.firestore, "contacts", this.contactId);
        await updateDoc(docRef, {
          name: values.name,
          email: values.email,
          telephone: values.phone,
          initials: initials,
        });
        this.saved.emit();
      }

      this.closeOverlay();
    } catch (err) {
      this.toastService.showError("Failed to save contact. Please try again.");
    }
  }

  /**
   * Deletes the current contact from Firestore.
   * Only available when editing an existing contact (contactId must exist).
   * Shows success/error toast and closes overlay on completion.
   *
   * @example
   * ```typescript
   * this.deleteContact(); // Deletes contact and closes overlay
   * ```
   */
  async deleteContact() {
    if (!this.contactId) {
      this.toastService.showError("Cannot delete contact: No contact ID provided");
      return;
    }

    try {
      await this.contactService.deleteContact(this.contactId);
      this.toastService.showSuccess("Contact deleted successfully");
      this.closeOverlay();
    } catch (error) {
      this.toastService.showError("Failed to delete contact. Please try again.");
    }
  }

  /**
   * Closes the edit/create overlay without saving.
   * Emits the closed event to notify parent component.
   *
   * @example
   * ```typescript
   * this.closeOverlay(); // Closes overlay and emits closed event
   * ```
   */
  closeOverlay() {
    this.closed.emit();
  }

  /**
   * Generates initials from a full name string.
   * Takes the first letter of each word and limits to 2 characters.
   *
   * @param name - Full name string (e.g., 'John Doe')
   * @returns Initials string limited to 2 characters (e.g., 'JD')
   *
   * @example
   * ```typescript
   * const initials = this.getInitials('John Doe'); // Returns: 'JD'
   * const initials2 = this.getInitials('Mary Jane Watson'); // Returns: 'MJ' (limited to 2)
   * ```
   */
  private getInitials(name: string): string {
    const parts = name.trim().split(" ");
    return parts.map(p => p[0].toUpperCase()).join("").substring(0, 2);
  }
}
