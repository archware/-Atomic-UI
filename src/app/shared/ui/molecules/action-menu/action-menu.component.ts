import {
  Component, signal, HostListener,
  ElementRef, ChangeDetectionStrategy, inject,
  ViewEncapsulation, OnInit, OnDestroy, Renderer2,
  input,
  output
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

let nextActionMenuId = 0;

export interface ActionMenuItem {
  id: string;
  icon?: string;
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info';
  disabled?: boolean;
}

@Component({
  selector: 'app-action-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="action-menu-wrapper" [class.open]="isOpen()">
      <button
        type="button"
        class="action-menu-trigger"
        [title]="triggerTitle()"
        [attr.aria-label]="triggerTitle()"
        (click)="toggleMenu($event)"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="menuId"
        aria-haspopup="menu"
        (keydown.arrowdown)="openMenuFromKeyboard($event)"
      >
        <i [class]="triggerIcon()" aria-hidden="true"></i>
      </button>
    </div>
  `,
  styleUrl: './action-menu.component.css'
})
export class ActionMenuComponent implements OnInit, OnDestroy {
  readonly actions = input<ActionMenuItem[]>([]);
  readonly triggerIcon = input<string>('fa-solid fa-ellipsis-vertical');
  readonly triggerTitle = input<string>('Opciones');
  readonly actionClick = output<string>();

  isOpen = signal(false);
  readonly menuId = `action-menu-portal-${nextActionMenuId++}`;

  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  private menuElement: HTMLElement | null = null;
  private menuListenerCleanups: (() => void)[] = [];

  private scrollListener = () => this.onScrollOrResize();
  private resizeListener = () => this.onScrollOrResize();

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.scrollListener, true);
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollListener, true);
      window.removeEventListener('resize', this.resizeListener);
    }
    this.destroyMenu();
  }

  private destroyMenu(): void {
    this.menuListenerCleanups.forEach((cleanup) => cleanup());
    this.menuListenerCleanups = [];
    if (this.menuElement) {
      this.renderer.removeChild(this.document.body, this.menuElement);
      this.menuElement = null;
    }
  }

  private onScrollOrResize(): void {
    if (this.isOpen()) {
      this.updatePosition();
    }
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.isOpen()) {
      this.closeMenu(true);
    } else {
      this.openMenu();
    }
  }

  openMenuFromKeyboard(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isOpen()) {
      this.openMenu();
    }
  }

  private openMenu(): void {
    if (this.actions().length === 0) return;
    this.isOpen.set(true);
    this.createMenuInBody();
  }

  toggleMenuProgrammatically(): void {
    this.toggleMenu(new Event('click'));
  }

  private closeMenu(restoreFocus = false): void {
    this.isOpen.set(false);
    this.destroyMenu();
    if (restoreFocus) {
      (this.elementRef.nativeElement.querySelector('.action-menu-trigger') as HTMLElement | null)?.focus();
    }
  }

  private createMenuInBody(): void {
    const triggerBtn = this.elementRef.nativeElement.querySelector('.action-menu-trigger');
    if (!triggerBtn) return;

    this.menuElement = this.renderer.createElement('div');
    this.renderer.addClass(this.menuElement, 'action-menu-portal');
    this.renderer.setAttribute(this.menuElement, 'id', this.menuId);
    this.renderer.setAttribute(this.menuElement, 'role', 'menu');
    this.renderer.setAttribute(this.menuElement, 'aria-label', this.triggerTitle());

    this.actions().forEach(action => {
      const btn = this.renderer.createElement('button');
      this.renderer.setAttribute(btn, 'type', 'button');
      this.renderer.addClass(btn, 'menu-item');
      if (action.variant) {
        this.renderer.addClass(btn, `menu-item--${action.variant}`);
      }
      if (action.disabled) {
        this.renderer.addClass(btn, 'disabled');
        this.renderer.setAttribute(btn, 'disabled', 'true');
      }
      this.renderer.setAttribute(btn, 'role', 'menuitem');

      if (action.icon) {
        const icon = this.renderer.createElement('i');
        action.icon.split(' ').forEach((cls: string) => this.renderer.addClass(icon, cls));
        this.renderer.setAttribute(icon, 'aria-hidden', 'true');
        this.renderer.appendChild(btn, icon);
      }

      const label = this.renderer.createElement('span');
      this.renderer.addClass(label, 'menu-item-label');
      const text = this.renderer.createText(action.label);
      this.renderer.appendChild(label, text);
      this.renderer.appendChild(btn, label);

      const cleanup = this.renderer.listen(btn, 'click', (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        if (!action.disabled) {
          this.actionClick.emit(action.id);
          this.closeMenu(true);
        }
      });
      this.menuListenerCleanups.push(cleanup);

      this.renderer.appendChild(this.menuElement, btn);
    });

    this.renderer.appendChild(this.document.body, this.menuElement);

    this.menuListenerCleanups.push(
      this.renderer.listen(this.menuElement, 'keydown', (event: KeyboardEvent) => this.onMenuKeydown(event))
    );

    requestAnimationFrame(() => {
      this.updatePosition();
      this.enabledMenuItems()[0]?.focus();
    });
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isOutsideComponent = !this.elementRef.nativeElement.contains(target);
    const isOutsideMenu = !this.menuElement || !this.menuElement.contains(target);

    if (isOutsideComponent && isOutsideMenu) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.closeMenu(true);
    }
  }

  private enabledMenuItems(): HTMLButtonElement[] {
    return this.menuElement
      ? Array.from(this.menuElement.querySelectorAll<HTMLButtonElement>('.menu-item:not(:disabled)'))
      : [];
  }

  private onMenuKeydown(event: KeyboardEvent): void {
    const items = this.enabledMenuItems();
    if (items.length === 0) return;
    const activeIndex = items.indexOf(this.document.activeElement as HTMLButtonElement);
    let nextIndex: number | null = null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % items.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      items[nextIndex]?.focus();
    }
  }

  private updatePosition(): void {
    if (!this.menuElement) return;
    const triggerBtn = this.elementRef.nativeElement.querySelector('.action-menu-trigger');
    if (!triggerBtn) return;

    const rect = triggerBtn.getBoundingClientRect();
    const menuRect = this.menuElement.getBoundingClientRect();
    const menuHeight = menuRect.height || 180;
    const menuWidth = menuRect.width || 160;

    const spaceBelow = window.innerHeight - rect.bottom;
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

    let top: number;
    let left: number;

    if (spaceBelow >= menuHeight) {
      top = rect.bottom + 4;
    } else {
      top = rect.top - menuHeight - 4;
    }
    
    // align right by default
    left = rect.right - menuWidth + rect.width;

    top = clamp(top, 8, window.innerHeight - menuHeight - 8);
    left = clamp(left, 8, window.innerWidth - menuWidth - 8);

    this.renderer.setStyle(this.menuElement, 'top', `${top}px`);
    this.renderer.setStyle(this.menuElement, 'left', `${left}px`);
  }
}
