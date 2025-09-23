import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-contact-menu',
  imports: [Button],
  templateUrl: './contact-menu.html',
  styleUrl: './contact-menu.scss'
})
export class ContactMenu {
  @Input() contactId?: string;

  @Output() editClicked = new EventEmitter<string>();
  @Output() deleteClicked = new EventEmitter<string>();

  // Signal for menu state
  protected isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  onEdit(): void {
    if (this.contactId) {
      this.editClicked.emit(this.contactId);
      this.isMenuOpen.set(false); // Close menu after action
    }
  }

  onDelete(): void {
    if (this.contactId) {
      this.deleteClicked.emit(this.contactId);
      this.isMenuOpen.set(false); // Close menu after action
    }
  }
}