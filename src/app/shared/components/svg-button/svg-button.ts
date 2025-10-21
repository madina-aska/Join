import { Component, Output, EventEmitter } from '@angular/core';

/**
 * A reusable SVG button component.
 *
 * Emits a click event when the button is pressed.
 * Can be used to wrap custom SVG graphics with click functionality.
 */
@Component({
  selector: 'app-svg-button',
  templateUrl: './svg-button.html',
  styleUrls: ['./svg-button.scss']
})
export class SvgButton {
  /**
   * Event emitted when the button is clicked.
   *
   * @event
   */
  @Output() onClick = new EventEmitter<void>();

  /**
   * Handles the button click and emits the `onClick` event.
   */
  onButtonClick(): void {
    this.onClick.emit();
  }
}
