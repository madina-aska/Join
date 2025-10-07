import { Component, input, output, inject } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { Task } from '@app/core/interfaces/task';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board-card',
  standalone: true,
  imports: [CommonModule, SlicePipe], // SlicePipe hinzugefügt, da es im Template verwendet wird
  templateUrl: "./board-card.html",
  styleUrl: "./board-card.scss",
})
export class BoardCard {
  // Input: Die darzustellende Aufgabe (Task)
  task = input.required<Task>();

  // Output: Sendet die ID der geklickten Karte an die BoardView, um die Detailansicht zu öffnen
  cardClicked = output<string>();

  // Output: Sendet ein Signal, wenn der Bearbeiten-Button geklickt wird
  editClicked = output<string>();

  // --- DEPENDENCIES ---
  private router = inject(Router);

  /**
   * Gibt die Farbe für die Task-Kategorie zurück.
   */
  getCategoryColor(): string {
    // Korrektur der String-Werte, um mit dem Task-Interface übereinzustimmen
    switch (this.task().category) {
      case "Technical Task":
        return "#1cb700"; // Beispiel-Farbe für Technical Task
      case "User Story":
        return "#003cff"; // Beispiel-Farbe für User Story
      case "Sales":
        return "#fc7171"; // Beispiel-Farbe für Sales (falls im Interface enthalten)
      default:
        return "#888"; // Standard-Farbe
    }
  }

  /**
   * Öffnet die Detailansicht der Aufgabe.
   */
  openDetailView() {
    if (this.task().id) {
        // Non-Null Assertion Operator (!) stellt sicher, dass der String-Typ gesendet wird.
        this.cardClicked.emit(this.task().id!);
    }
  }

  /**
   * Bearbeitet die Aufgabe und verhindert das Öffnen der Detailansicht.
   * @param event Das DOM-Ereignis des Klicks.
   */
  editTask(event: Event) {
    // Wichtig: Stoppt die Event-Propagation, damit der Klick nicht die openDetailView-Methode der gesamten Karte auslöst
    event.stopPropagation();
    if (this.task().id) {
        // Non-Null Assertion Operator (!) stellt sicher, dass der String-Typ gesendet wird.
        this.editClicked.emit(this.task().id!);
    }
  }
}
