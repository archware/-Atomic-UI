import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant) {
      @case ('text') {
        <div class="skeleton skeleton-text" [style.width]="width" [style.height]="height || '1rem'"></div>
      }
      @case ('circular') {
        <div class="skeleton skeleton-circular" [style.width]="width || '3rem'" [style.height]="height || '3rem'"></div>
      }
      @case ('rectangular') {
        <div class="skeleton skeleton-rectangular" [style.width]="width || '100%'" [style.height]="height || '8rem'"></div>
      }
      @case ('card') {
        <div class="skeleton-card">
          <div class="skeleton skeleton-rectangular" style="height: 140px"></div>
          <div class="skeleton-card-content">
            <div class="skeleton skeleton-text" style="width: 80%; height: 1rem"></div>
            <div class="skeleton skeleton-text" style="width: 60%; height: 0.75rem"></div>
            <div class="skeleton skeleton-text" style="width: 40%; height: 0.75rem"></div>
          </div>
        </div>
      }
      @case ('avatar-text') {
        <div class="skeleton-avatar-text">
          <div class="skeleton skeleton-circular" style="width: 2.5rem; height: 2.5rem"></div>
          <div class="skeleton-text-group">
            <div class="skeleton skeleton-text" style="width: 120px; height: 0.875rem"></div>
            <div class="skeleton skeleton-text" style="width: 80px; height: 0.75rem"></div>
          </div>
        </div>
      }
      @default {
        <div class="skeleton" [style.width]="width" [style.height]="height"></div>
      }
    }
  `,
  styles: [`
    /* Host display block needed for % widths to work */
    :host {
      display: block;
      width: 100%;
    }

    .skeleton {
      background: linear-gradient(90deg, 
        #e2e8f0 25%, 
        #cbd5e1 50%, 
        #e2e8f0 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      border-radius: 0.25rem;
    }

    .skeleton-text {
      height: 1rem;
      border-radius: 0.25rem;
    }

    .skeleton-circular {
      border-radius: 50%;
    }

    .skeleton-rectangular {
      border-radius: 0.5rem;
    }

    .skeleton-card {
      background: var(--surface-background, #ffffff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .skeleton-card-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-avatar-text {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .skeleton-text-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Dark mode - HIGH VISIBILITY */
    :host-context(.dark) .skeleton,
    :host-context(html.dark) .skeleton,
    :host-context([data-theme="dark"]) .skeleton {
      background: linear-gradient(90deg, 
        #64748b 25%, 
        #94a3b8 50%, 
        #64748b 75%
      );
      background-size: 200% 100%;
    }

    :host-context(.dark) .skeleton-card,
    :host-context(html.dark) .skeleton-card,
    :host-context([data-theme="dark"]) .skeleton-card {
      background: #334155;
      border-color: #64748b;
    }
  `]
})
export class SkeletonComponent {
  @Input() variant: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar-text' = 'text';
  @Input() width?: string;
  @Input() height?: string;
}
