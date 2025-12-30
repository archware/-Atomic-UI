import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../../shared/ui/atoms/loader/loader.component';
import { SkeletonComponent } from '../../../../shared/ui/atoms/skeleton/skeleton.component';

@Component({
  selector: 'app-showcase-status',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    SkeletonComponent
  ],
  template: `
    <!-- LOADERS -->
    <section class="showcase-section">
      <h3 class="section-title">Loaders</h3>
      <div class="loader-grid">
        <div class="loader-item">
          <app-loader variant="spinner" size="lg"></app-loader>
          <span class="loader-label">Spinner</span>
        </div>
        <div class="loader-item">
          <app-loader variant="dots" size="lg"></app-loader>
          <span class="loader-label">Dots</span>
        </div>
        <div class="loader-item">
          <app-loader variant="pulse" size="lg"></app-loader>
          <span class="loader-label">Pulse</span>
        </div>
        <div class="loader-item">
          <app-loader variant="bars" size="lg"></app-loader>
          <span class="loader-label">Bars</span>
        </div>
        <div class="loader-item loader-item-gradient">
          <app-loader variant="gradient" size="lg"></app-loader>
          <span class="loader-label">Gradient</span>
        </div>
        <div class="loader-item">
          <app-loader variant="orbit" size="lg"></app-loader>
          <span class="loader-label">Orbit</span>
        </div>
      </div>
      
      <h4 class="subsection-title">Tamaños</h4>
      <div class="loader-sizes">
        <div class="loader-size-item">
          <app-loader variant="spinner" size="sm"></app-loader>
          <span>Small</span>
        </div>
        <div class="loader-size-item">
          <app-loader variant="spinner" size="md"></app-loader>
          <span>Medium</span>
        </div>
        <div class="loader-size-item">
          <app-loader variant="spinner" size="lg"></app-loader>
          <span>Large</span>
        </div>
      </div>
    </section>

    <!-- LOADING STATES -->
    <section class="showcase-section">
      <h3 class="section-title">Estados de Carga</h3>
      <div class="loading-container">
        <app-loader variant="spinner" size="md"></app-loader>
        <app-skeleton variant="text" width="100%"></app-skeleton>
        <app-skeleton variant="text" width="60%"></app-skeleton>
        <app-skeleton variant="circular" width="3rem" height="3rem"></app-skeleton>
      </div>
    </section>

    <!-- PROGRESS -->
    <section class="showcase-section">
      <h3 class="section-title">Progreso</h3>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: 75%"></div>
        </div>
        <span class="progress-label">75%</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar progress-success">
          <div class="progress-fill" style="width: 100%"></div>
        </div>
        <span class="progress-label">Completado</span>
      </div>
    </section>
  `,
  styles: [`
    .showcase-section { margin-bottom: 2rem; display: block; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-color); }
    .subsection-title { font-size: 1rem; font-weight: 500; margin: 1rem 0 0.5rem; color: var(--text-color-secondary); }
    
    .loader-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
    .loader-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--surface-card); border-radius: 0.5rem; }
    .loader-sizes { display: flex; gap: 2rem; align-items: flex-end; }
    .loader-size-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    
    .loading-container { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: var(--surface-card); border-radius: 0.5rem; border: 1px solid var(--border-color); }
    
    /* Progress bar styles */
    .progress-container { margin-bottom: 1rem; }
    .progress-bar { height: 0.5rem; background: var(--surface-hover); border-radius: 999px; overflow: hidden; margin-bottom: 0.25rem; }
    .progress-fill { height: 100%; background: var(--primary-color); border-radius: 999px; }
    .progress-success .progress-fill { background: var(--success-color); }
    .progress-label { font-size: 0.875rem; color: var(--text-color-secondary); }
  `]
})
export class ShowcaseStatusComponent { }
