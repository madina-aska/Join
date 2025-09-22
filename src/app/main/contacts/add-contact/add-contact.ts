import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-contact',
  imports: [FormsModule, RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './add-contact.html',
  styleUrl: './add-contact.scss'
})
export class AddContact {
   contactForm: FormGroup;
   isOverlayOpen = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern(/^[A-ZÄÖÜa-zäöüß]+(?:\s[A-ZÄÖÜa-zäöüß]+)+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)
      ]]
    });
  }

   onSubmit() {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      alert('Kontakt erfolgreich erstellt!');
      this.contactForm.reset();
      this.closeOverlay();
    }
  }

  closeOverlay() {
    this.isOverlayOpen = false;
  }

  openOverlay() {
    this.isOverlayOpen = true;
  }

}

