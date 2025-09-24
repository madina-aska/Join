import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { doc, Firestore, updateDoc, addDoc, collection, getDoc } from "@angular/fire/firestore";
import { Contact } from "app/core/interfaces/contact";

@Component({
  selector: "app-edit-contact",
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: "./edit-contact.html",
  styleUrl: "./edit-contact.scss",
})
export class EditContact implements OnInit {
  @Input() contactId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);

  contactForm: FormGroup;
  isEdit = false;

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

  ngOnInit() {
    this.isEdit = !!this.contactId;
    if (this.isEdit) {
      this.loadContactData();
    }
  }

  async loadContactData() {
    if (!this.contactId) return;

    const docRef = doc(this.firestore, "contacts", this.contactId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as Contact;
      this.contactForm.patchValue({
        name: data.name,
        email: data.email,
        phone: data.telephone,
      });
    } else {
      console.error("No contact found for ID:", this.contactId);
      this.closeOverlay();
    }
  }

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
        console.log("Kontakt aktualisiert:", values);
      } else {
        // Neuer Kontakt erstellen
        const colRef = collection(this.firestore, "contacts");
        await addDoc(colRef, {
          name: values.name,
          email: values.email,
          telephone: values.phone,
          initials: initials,
          color: this.getRandomColor(),
        });
        console.log("Neuer Kontakt erstellt:", values);
      }

      this.closeOverlay();
    } catch (err) {
      console.error("Fehler beim Speichern des Kontakts:", err);
    }
  }

  closeOverlay() {
    this.closed.emit();
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(" ");
    return parts.map(p => p[0].toUpperCase()).join("").substring(0, 2);
  }

  private getRandomColor(): string {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFC300"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
