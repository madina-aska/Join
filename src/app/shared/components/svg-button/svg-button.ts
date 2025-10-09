import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-svg-button',
  templateUrl: './svg-button.html',
  styleUrls: ['./svg-button.scss']
})
export class SvgButton{
  // 1. Definiert ein Event, das ausgelöst wird, wenn der Button geklickt wird
  @Output() onClick = new EventEmitter<void>();

  onButtonClick() {
    this.onClick.emit();
  }
}
