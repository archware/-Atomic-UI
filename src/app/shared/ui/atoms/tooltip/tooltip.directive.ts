import {
  Directive, input, HostListener,
  ElementRef, inject, OnDestroy, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * TooltipDirective
 *
 * Uso:
 * ```html
 * <button appTooltip="Copiar" tooltipPosition="top">...</button>
 * ```
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
  host: {
    '[attr.data-tooltip]': 'appTooltip()',
    '[attr.data-tooltip-pos]': 'tooltipPosition()',
    'class': 'tooltip-host',
  },
})
export class TooltipDirective implements OnDestroy {
  readonly appTooltip      = input.required<string>();
  readonly tooltipPosition = input<TooltipPosition>('top');

  private readonly el         = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private tooltipEl: HTMLElement | null = null;
  private listenersAttached = false;
  private readonly onViewportChange = (): void => {
    if (!this.tooltipEl) return;
    if (!this.el.nativeElement.isConnected) {
      this.hide();
      return;
    }
    this.positionTooltip();
  };

  @HostListener('mouseenter')
  @HostListener('focusin')
  show(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.hide();
    const text = this.appTooltip();
    if (!text) return;
    const tip = document.createElement('div');
    tip.className = `tooltip tooltip--${this.tooltipPosition()}`;
    tip.textContent = text;
    tip.setAttribute('role', 'tooltip');
    tip.style.visibility = 'hidden';
    tip.style.position   = 'fixed';
    tip.style.top        = '0px';
    tip.style.left       = '0px';
    tip.style.zIndex     = '9999';
    document.body.appendChild(tip);
    this.tooltipEl = tip;
    this.positionTooltip();
    this.attachViewportListeners();
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  @HostListener('blur')
  @HostListener('document:keydown.escape')
  hide(): void {
    this.detachViewportListeners();
    this.tooltipEl?.remove();
    this.tooltipEl = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private attachViewportListeners(): void {
    if (this.listenersAttached || typeof window === 'undefined') return;
    window.addEventListener('scroll', this.onViewportChange, true);
    window.addEventListener('resize', this.onViewportChange);
    this.listenersAttached = true;
  }

  private detachViewportListeners(): void {
    if (!this.listenersAttached || typeof window === 'undefined') return;
    window.removeEventListener('scroll', this.onViewportChange, true);
    window.removeEventListener('resize', this.onViewportChange);
    this.listenersAttached = false;
  }

  private resolveTriggerRect(): DOMRect {
    const host = this.el.nativeElement;
    const hostRect = host.getBoundingClientRect();
    if (
      host.tagName.includes('-') &&
      host.children.length === 1 &&
      host.firstElementChild instanceof HTMLElement
    ) {
      const childRect = host.firstElementChild.getBoundingClientRect();
      if (
        childRect.width > 0 &&
        childRect.height > 0 &&
        (hostRect.width === 0 || childRect.width < hostRect.width || hostRect.height === 0 || childRect.height < hostRect.height)
      ) {
        return childRect;
      }
    }
    return hostRect;
  }

  private positionTooltip(): void {
    if (!this.tooltipEl) return;
    const rect = this.resolveTriggerRect();
    const tip  = this.tooltipEl;
    const pos  = this.tooltipPosition();

    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;

    const GAP = 8;
    const VIEWPORT_MARGIN = 8;
    let top = 0;
    let left = 0;

    switch (pos) {
      case 'top':
        top  = rect.top - th - GAP;
        left = rect.left + (rect.width - tw) / 2;
        if (window.innerWidth > tw + VIEWPORT_MARGIN * 2) {
          left = Math.min(
            Math.max(left, VIEWPORT_MARGIN),
            window.innerWidth - tw - VIEWPORT_MARGIN
          );
        }
        break;
      case 'bottom':
        top  = rect.bottom + GAP;
        left = rect.left + (rect.width - tw) / 2;
        if (window.innerWidth > tw + VIEWPORT_MARGIN * 2) {
          left = Math.min(
            Math.max(left, VIEWPORT_MARGIN),
            window.innerWidth - tw - VIEWPORT_MARGIN
          );
        }
        break;
      case 'left':
        top  = rect.top + (rect.height - th) / 2;
        left = rect.left - tw - GAP;
        if (window.innerHeight > th + VIEWPORT_MARGIN * 2) {
          top = Math.min(
            Math.max(top, VIEWPORT_MARGIN),
            window.innerHeight - th - VIEWPORT_MARGIN
          );
        }
        break;
      case 'right':
        top  = rect.top + (rect.height - th) / 2;
        left = rect.right + GAP;
        if (window.innerHeight > th + VIEWPORT_MARGIN * 2) {
          top = Math.min(
            Math.max(top, VIEWPORT_MARGIN),
            window.innerHeight - th - VIEWPORT_MARGIN
          );
        }
        break;
    }

    tip.style.top  = `${top}px`;
    tip.style.left = `${left}px`;
    tip.style.visibility = 'visible';
  }
}
