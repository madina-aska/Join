import { Injectable, signal } from '@angular/core';
import { ToastAction } from '@shared/components/toast/toast';

/**
 * Configuration interface for toast notifications.
 *
 * @interface ToastConfig
 *
 * @example
 * ```typescript
 * const config: ToastConfig = {
 *   type: 'success',
 *   message: 'Contact saved successfully',
 *   title: 'Success',
 *   duration: 1500,
 *   action: { label: 'Undo', handler: () => this.undo() }
 * };
 * ```
 */
export interface ToastConfig {
  /** Toast type determining color scheme and icon */
  type: 'success' | 'error' | 'warning' | 'info';

  /** Optional title text displayed prominently */
  title?: string;

  /** Main message content of the toast */
  message: string;

  /** Duration in milliseconds before auto-hide (default varies by type) */
  duration?: number;

  /** Optional icon override (falls back to type-based icon) */
  icon?: string;

  /** If true, toast won't auto-hide and requires manual dismissal */
  persistent?: boolean;

  /** Optional action button with label and click handler */
  action?: ToastAction;

  /** Optional multiple action buttons with labels and click handlers */
  actions?: ToastAction[];
}

/**
 * Service for displaying toast notifications throughout the application.
 *
 * This service provides a centralized way to show different types of toast messages
 * including success, error, warning, and info notifications. It uses Angular signals
 * for reactive state management and supports action buttons for interactive toasts.
 *
 * Features:
 * - **Multiple toast types** with appropriate styling and duration
 * - **Action buttons** for interactive notifications (e.g., Undo, Confirm)
 * - **Automatic hiding** with configurable durations
 * - **Signal-based reactivity** for real-time UI updates
 * - **Type-safe configuration** with TypeScript interfaces
 *
 * Default Durations:
 * - Success: 1500ms
 * - Error: 5000ms
 * - Warning: 4000ms (5000ms with action)
 * - Info: 4000ms
 *
 * @example
 * ```typescript
 * // Inject the service
 * private toastService = inject(ToastService);
 *
 * // Show different toast types
 * this.toastService.showSuccess('Contact saved');
 * this.toastService.showError('Save failed');
 * this.toastService.showWarningWithAction('Delete contact?', {
 *   label: 'Delete',
 *   handler: () => this.deleteContact()
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /** Signal holding the current active toast configuration */
  protected currentToast = signal<ToastConfig | null>(null);

  /**
   * Read-only getter for accessing current toast state.
   * Components subscribe to this signal to display toast notifications.
   *
   * @returns Read-only signal containing current toast configuration or null
   *
   * @example
   * ```typescript
   * // In a component
   * toastSignal = this.toastService.toast;
   *
   * // In template
   * @if (toastSignal(); as toast) {
   *   <app-toast [config]="toast"></app-toast>
   * }
   * ```
   */
  get toast() {
    return this.currentToast.asReadonly();
  }

  /**
   * Displays a success toast notification.
   * Uses green styling and shorter duration for positive feedback.
   *
   * @param message - Main success message to display
   * @param title - Optional title for the toast
   *
   * @example
   * ```typescript
   * this.toastService.showSuccess('Contact saved successfully');
   * this.toastService.showSuccess('Data updated', 'Success');
   * ```
   */
  showSuccess(message: string, title?: string): void {
    this.show({
      type: 'success',
      message,
      title,
      duration: 1500
    });
  }

  /**
   * Displays an error toast notification.
   * Uses red styling and longer duration for critical messages.
   *
   * @param message - Error message to display to user
   * @param title - Optional title for the error toast
   *
   * @example
   * ```typescript
   * this.toastService.showError('Failed to save contact');
   * this.toastService.showError('Network error occurred', 'Error');
   * ```
   */
  showError(message: string, title?: string): void {
    this.show({
      type: 'error',
      message,
      title,
      duration: 5000
    });
  }

  /**
   * Displays a warning toast notification.
   * Uses yellow/orange styling for cautionary messages.
   *
   * @param message - Warning message to display
   * @param title - Optional title for the warning toast
   *
   * @example
   * ```typescript
   * this.toastService.showWarning('Changes not saved');
   * this.toastService.showWarning('Form has validation errors', 'Warning');
   * ```
   */
  showWarning(message: string, title?: string): void {
    this.show({
      type: 'warning',
      message,
      title,
      duration: 4000
    });
  }

  /**
   * Displays a warning toast with an interactive action button.
   * Commonly used for confirmation dialogs or undo actions.
   * Uses longer duration to allow user interaction.
   *
   * @param message - Warning message to display
   * @param action - Action button configuration with label and handler
   * @param title - Optional title for the warning toast
   *
   * @example
   * ```typescript
   * this.toastService.showWarningWithAction(
   *   'Delete this contact?',
   *   {
   *     label: 'Delete',
   *     handler: () => this.performDelete(contactId)
   *   }
   * );
   * ```
   */
  showWarningWithAction(message: string, action: ToastAction, title?: string): void {
    this.show({
      type: 'warning',
      message,
      title,
      action,
      duration: 5000
    });
  }

  /**
   * Displays a warning toast with multiple interactive action buttons.
   * Commonly used for confirmation dialogs with cancel/confirm options.
   * Uses longer duration to allow user interaction.
   *
   * @param message - Warning message to display
   * @param actions - Array of action buttons with labels and handlers
   * @param title - Optional title for the warning toast
   *
   * @example
   * ```typescript
   * this.toastService.showWarningWithActions(
   *   'Delete this contact?',
   *   [
   *     { label: 'Cancel', handler: () => this.cancelAction() },
   *     { label: 'Delete', handler: () => this.performDelete(contactId) }
   *   ]
   * );
   * ```
   */
  showWarningWithActions(message: string, actions: ToastAction[], title?: string): void {
    this.show({
      type: 'warning',
      message,
      title,
      actions,
      duration: 5000
    });
  }

  /**
   * Displays an informational toast notification.
   * Uses blue styling for neutral information messages.
   *
   * @param message - Information message to display
   * @param title - Optional title for the info toast
   *
   * @example
   * ```typescript
   * this.toastService.showInfo('New feature available');
   * this.toastService.showInfo('Data synchronized', 'Info');
   * ```
   */
  showInfo(message: string, title?: string): void {
    this.show({
      type: 'info',
      message,
      title,
      duration: 4000
    });
  }

  /**
   * Generic method for displaying any toast with custom configuration.
   * Used internally by specific toast methods (showSuccess, showError, etc.).
   *
   * @param config - Complete toast configuration object
   *
   * @example
   * ```typescript
   * this.toastService.show({
   *   type: 'warning',
   *   message: 'Custom warning',
   *   duration: 3000,
   *   persistent: true
   * });
   * ```
   */
  show(config: ToastConfig): void {
    this.currentToast.set(config);
  }

  /**
   * Hides the currently displayed toast immediately.
   * Called automatically after duration expires or manually by user/component.
   *
   * @example
   * ```typescript
   * this.toastService.hide(); // Immediately hides current toast
   * ```
   */
  hide(): void {
    this.currentToast.set(null);
  }
}