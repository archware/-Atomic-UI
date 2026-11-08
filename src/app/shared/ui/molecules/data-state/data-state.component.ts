import { Component, TemplateRef, ChangeDetectionStrategy, contentChild, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LoaderComponent, LoaderSize, LoaderVariant } from '../../atoms/loader/loader.component';
import { ApiError } from '../../services/api.service';
import { ButtonComponent } from '../../atoms/button/button.component';

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
 *       <button type="button" (click)="retry()">Reintentar</button>
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
  imports: [NgTemplateOutlet, LoaderComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Loading State -->
    @if (loading()) {
      <div class="data-state data-state--loading">
        @if (loadingTemplate(); as loadingTpl) {
          <ng-container [ngTemplateOutlet]="loadingTpl"></ng-container>
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
        @if (errorTemplate(); as errorTpl) {
          <ng-container [ngTemplateOutlet]="errorTpl" [ngTemplateOutletContext]="{ $implicit: currentError }"></ng-container>
        } @else {
          <div class="error-container">
            <div class="error-icon">
              <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            <h4 class="error-title">{{ errorTitle() }}</h4>
            <p class="error-message">{{ currentError.message }}</p>
            @if (showRetryButton()) {
              <app-button class="retry-button" variant="outline" icon="fa-solid fa-rotate-right" (buttonClick)="onRetry().emit()">
                Reintentar
              </app-button>
            }
          </div>
        }
      </div>
    }

    <!-- Empty State -->
    @else if (isEmpty()) {
      <div class="data-state data-state--empty">
        @if (emptyTemplate(); as emptyTpl) {
          <ng-container [ngTemplateOutlet]="emptyTpl"></ng-container>
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
      @if (contentTemplate(); as contentTpl) {
        <ng-container [ngTemplateOutlet]="contentTpl"></ng-container>
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
  readonly loaderVariant = input<LoaderVariant>('spinner');
  readonly loaderSize = input<LoaderSize>('md');
  readonly errorTitle = input('Error al cargar');
  readonly emptyText = input('No hay datos disponibles');
  readonly showRetryButton = input(true);

  // Events
  readonly onRetry = input({ emit: () => { } }); // Simple event pattern

  // Templates
  readonly contentTemplate = contentChild<TemplateRef<unknown>>('content');
  readonly loadingTemplate = contentChild<TemplateRef<unknown>>('loadingTemplate');
  readonly errorTemplate = contentChild<TemplateRef<unknown>>('errorTemplate');
  readonly emptyTemplate = contentChild<TemplateRef<unknown>>('emptyTemplate');
}
