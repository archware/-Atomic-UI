import { Component, ContentChild, TemplateRef, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../atoms/loader/loader.component';
import { ApiError } from '../../services/api.service';

/**
 * Componente para manejar estados de carga de datos.
 * Muestra automáticamente: loading, error, o contenido según el estado.
 *
 * @example
 * ```html
 * <app-data-state [loading]="usersApi.loading()" [error]="usersApi.error()">
 *   <ng-template #content>
 *     @for (user of usersApi.data(); track user.id) {
 *       <p>{{ user.name }}</p>
 *     }
 *   </ng-template>
 * </app-data-state>
 * ```
 *
 * @example Con templates personalizados
 * ```html
 * <app-data-state [loading]="loading()" [error]="error()">
 *   <ng-template #loadingTemplate>
 *     <div class="custom-loader">Cargando usuarios...</div>
 *   </ng-template>
 *
 *   <ng-template #errorTemplate let-error>
 *     <div class="custom-error">
 *       <h3>¡Ups! Algo salió mal</h3>
 *       <p>{{ error.message }}</p>
 *       <button (click)="retry()">Reintentar</button>
 *     </div>
 *   </ng-template>
 *
 *   <ng-template #content>
 *     <!-- Contenido con datos -->
 *   </ng-template>
 * </app-data-state>
 * ```
 *
 * @example Con empty state
 * ```html
 * <app-data-state [loading]="loading()" [error]="error()" [isEmpty]="data()?.length === 0">
 *   <ng-template #emptyTemplate>
 *     <p>No hay datos disponibles</p>
 *   </ng-template>
 *
 *   <ng-template #content>
 *     <!-- Contenido -->
 *   </ng-template>
 * </app-data-state>
 * ```
 */
@Component({
  selector: 'app-data-state',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Loading State -->
    @if (loading()) {
      <div class="data-state data-state--loading">
        @if (loadingTemplate) {
          <ng-container *ngTemplateOutlet="loadingTemplate"></ng-container>
        } @else {
          <app-loader [variant]="loaderVariant()" [size]="loaderSize()"></app-loader>
          @if (loadingText()) {
            <p class="loading-text">{{ loadingText() }}</p>
          }
        }
      </div>
    }

    <!-- Error State -->
    @else if (error(); as currentError) {
      <div class="data-state data-state--error">
        @if (errorTemplate) {
          <ng-container *ngTemplateOutlet="errorTemplate; context: { $implicit: error() }"></ng-container>
        } @else {
          <div class="error-container">
            <div class="error-icon">
              <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            <h4 class="error-title">{{ errorTitle() }}</h4>
            <p class="error-message">{{ currentError.message }}</p>
            @if (showRetryButton()) {
              <button type="button" class="retry-button" (click)="onRetry().emit()">
                <i class="fa-solid fa-rotate-right"></i>
                Reintentar
              </button>
            }
          </div>
        }
      </div>
    }

    <!-- Empty State -->
    @else if (isEmpty()) {
      <div class="data-state data-state--empty">
        @if (emptyTemplate) {
          <ng-container *ngTemplateOutlet="emptyTemplate"></ng-container>
        } @else {
          <div class="empty-container">
            <div class="empty-icon">
              <i class="fa-solid fa-inbox"></i>
            </div>
            <p class="empty-text">{{ emptyText() }}</p>
          </div>
        }
      </div>
    }

    <!-- Content -->
    @else {
      @if (contentTemplate) {
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      }
    }
  `,
  styleUrl: './data-state.component.css'
})
export class DataStateComponent {
  readonly loading = input(false);
  readonly error = input<ApiError | null>(null);
  readonly isEmpty = input(false);

  // Customization
  readonly loadingText = input('');
  readonly loaderVariant = input<'spinner' | 'dots' | 'pulse' | 'bars'>('spinner');
  readonly loaderSize = input<'sm' | 'md' | 'lg'>('md');
  readonly errorTitle = input('Error al cargar');
  readonly emptyText = input('No hay datos disponibles');
  readonly showRetryButton = input(true);

  // Events
  readonly onRetry = input({ emit: () => { } }); // Simple event pattern

  // Templates
  @ContentChild('content') contentTemplate?: TemplateRef<unknown>;
  @ContentChild('loadingTemplate') loadingTemplate?: TemplateRef<unknown>;
  @ContentChild('errorTemplate') errorTemplate?: TemplateRef<unknown>;
  @ContentChild('emptyTemplate') emptyTemplate?: TemplateRef<unknown>;
}
