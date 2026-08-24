import {
  Component, signal, HostListener,
  ElementRef, ChangeDetectionStrategy, inject,
  ViewEncapsulation, OnInit, OnDestroy, Renderer2,
  input,
  output
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  resolveTableActionIcon,
  resolveTableActionTone,
  TableActionName,
} from '../../atoms/table-action/table-action';

let nextActionGroupId = 0;

/**
 * Representa una acción individual en el grupo
 */
export interface ActionItem {
  /** Identificador único de la acción */
  id: string;
  /** Clase de icono FontAwesome, e.g. 'fa-solid fa-eye' */
  icon?: string;
  /** Nombre semantico del atomo TableAction. */
  action?: TableActionName;
  /** Texto del tooltip y label en el menú */
  label: string;
  /** Variante de color */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info';
  /** Si la acción está deshabilitada */
  disabled?: boolean;
  /** Presenta carga y bloquea temporalmente la accion. */
  loading?: boolean;
}

type MenuPosition = 'auto' | 'top' | 'bottom' | 'left' | 'right';

/**
 * ActionGroupComponent - Grupo de acciones con overflow inteligente
 * 
 * Características:
 * - Muestra los primeros N botones directamente (default 3)
 * - Oculta el resto en un menú desplegable identificado por un caret
 * - Posicionamiento inteligente que evita solapamiento con bordes de pantalla
 * - Soporte para modo compacto (todas las acciones en menú)
 * 
 * @example
 * ```html
 * <app-action-group
 *   [actions]="[
 *     { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver' },
 *     { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
 *     { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' }
 *   ]"
 *   [maxVisible]="3"
 *   (actionClick)="onAction($event)">
 * </app-action-group>
 * ```
 */
@Component({
  selector: 'app-action-group, prest-action-group',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="action-group" [class.compact]="compact()" [class]="'action-group--' + size()">
      <!-- Visible Actions -->
      @if (!compact()) {
        @for (action of visibleActions(); track action.id) {
          <button
            type="button"
            class="action-btn"
            [class]="'action-btn--' + actionVariant(action)"
            [class.disabled]="action.disabled || action.loading"
            [title]="action.label"
            [attr.aria-label]="action.label"
            [disabled]="action.disabled || action.loading"
            [attr.aria-busy]="action.loading || null"
            (click)="onActionClick(action)"
          >
            @if (action.loading) {
              <span class="action-spinner" aria-hidden="true"></span>
            } @else {
              <i [class]="actionIconClass(action)" aria-hidden="true"></i>
            }
          </button>
        }
      }

      <!-- More Button (if there are overflow actions or compact mode) -->
      @if ((hasOverflow() || compact()) && menuActions().length > 0) {
        <div class="more-wrapper" [class.open]="isOpen()">
          <button
            type="button"
            class="action-btn action-btn--more"
            [title]="compact() ? 'Acciones' : 'Más acciones'"
            [attr.aria-label]="compact() ? 'Acciones' : 'Más acciones'"
            (click)="toggleMenu($event)"
            [attr.aria-expanded]="isOpen()"
            [attr.aria-controls]="menuId"
            aria-haspopup="menu"
            (keydown.arrowdown)="openMenuFromKeyboard($event)"
          >
            <i class="fa-solid fa-caret-down action-more-icon" aria-hidden="true"></i>
          </button>
          <!-- Menu se crea dinámicamente en document.body -->
        </div>
      }
    </div>
  `,
  styleUrl: './action-group.component.css'
})
export class ActionGroupComponent implements OnInit, OnDestroy {
  /** Lista de acciones a mostrar */
  readonly actions = input<ActionItem[]>([]);

  /** Número máximo de acciones visibles antes de overflow */
  readonly maxVisible = input(3);

  /** Dirección del menú desplegable: vertical (con labels) u horizontal (solo iconos) */
  readonly direction = input<'vertical' | 'horizontal'>('vertical');

  /** Posición preferida del menú (auto = calcula automáticamente) */
  readonly menuPosition = input<MenuPosition>('auto');

  /** Modo compacto: oculta todas las acciones en el menú */
  readonly compact = input(false);

  /** Tamaño de los botones: sm (2var(--space-2)), md (3var(--space-2)), lg (44px) */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Emitido cuando se hace clic en una acción */
  readonly actionClick = output<string>();

  /** Estado del menú */
  isOpen = signal(false);

  /** Relaciona el disparador con el menu portal para lectores de pantalla. */
  readonly menuId = `action-group-menu-${nextActionGroupId++}`;


  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  // Elemento del menú en el body
  private menuElement: HTMLElement | null = null;
  private menuListenerCleanups: (() => void)[] = [];

  // Bound listeners para poder removerlos
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
    // Limpiar menú si existe
    this.destroyMenu();
  }

  /** Destruir menú del body */
  private destroyMenu(): void {
    this.menuListenerCleanups.forEach((cleanup) => cleanup());
    this.menuListenerCleanups = [];
    if (this.menuElement) {
      this.renderer.removeChild(this.document.body, this.menuElement);
      this.menuElement = null;
    }
  }

  /** Recalcular posición en scroll/resize */
  private onScrollOrResize(): void {
    if (this.isOpen()) {
      this.updatePosition();
    }
  }

  /** Acciones visibles (primeras N) */
  visibleActions(): ActionItem[] {
    if (this.compact()) return [];
    return this.actions().slice(0, this.visibleLimit());
  }

  /** Acciones en el menú overflow */
  menuActions(): ActionItem[] {
    if (this.compact()) return this.actions();
    return this.actions().slice(this.visibleLimit());
  }

  /** ¿Hay acciones en overflow? */
  hasOverflow(): boolean {
    return this.actions().length > this.visibleLimit();
  }

  actionIconClass(action: ActionItem): string {
    return resolveTableActionIcon(action.action ?? 'custom', action.icon);
  }

  actionVariant(action: ActionItem): string {
    return action.variant ?? resolveTableActionTone(action.action ?? 'custom');
  }

  private visibleLimit(): number {
    const maxVisible = this.maxVisible();
    return Number.isFinite(maxVisible) ? Math.max(0, Math.floor(maxVisible)) : 3;
  }

  /** Toggle del menú */
  toggleMenu(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const wasOpen = this.isOpen();

    if (wasOpen) {
      // Cerrar menú
      this.closeMenu(true);
    } else {
      // Abrir menú
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
    if (this.menuActions().length === 0) return;
    this.isOpen.set(true);
    this.createMenuInBody();
  }

  private closeMenu(restoreFocus = false): void {
    this.isOpen.set(false);
    this.destroyMenu();
    if (restoreFocus) {
      (this.elementRef.nativeElement.querySelector('.action-btn--more') as HTMLElement | null)
        ?.focus();
    }
  }

  /** Crear menú en document.body */
  private createMenuInBody(): void {
    const moreBtn = this.elementRef.nativeElement.querySelector('.action-btn--more');
    if (!moreBtn) return;

    // Crear elemento del menú
    this.menuElement = this.renderer.createElement('div');
    this.renderer.addClass(this.menuElement, 'action-menu-portal');
    this.renderer.setAttribute(this.menuElement, 'id', this.menuId);
    this.renderer.setAttribute(this.menuElement, 'role', 'menu');
    this.renderer.setAttribute(this.menuElement, 'aria-label', 'Acciones adicionales');
    const direction = this.direction();
    this.renderer.setAttribute(this.menuElement, 'aria-orientation', direction);
    if (direction === 'horizontal') {
      this.renderer.addClass(this.menuElement, 'horizontal');
    }

    // Crear items del menú
    const actions = this.menuActions();
    actions.forEach(action => {
      const btn = this.renderer.createElement('button');
      this.renderer.setAttribute(btn, 'type', 'button');
      this.renderer.addClass(btn, 'menu-item');
      this.renderer.addClass(btn, `menu-item--${this.actionVariant(action)}`);
      if (action.disabled || action.loading) {
        this.renderer.addClass(btn, 'disabled');
        this.renderer.setAttribute(btn, 'disabled', 'true');
      }
      this.renderer.setAttribute(btn, 'role', 'menuitem');
      this.renderer.setAttribute(btn, 'aria-label', action.label);
      if (action.loading) {
        this.renderer.setAttribute(btn, 'aria-busy', 'true');
      }

      // Icono
      if (action.loading) {
        const spinner = this.renderer.createElement('span');
        this.renderer.addClass(spinner, 'action-spinner');
        this.renderer.setAttribute(spinner, 'aria-hidden', 'true');
        this.renderer.appendChild(btn, spinner);
      } else {
        const icon = this.renderer.createElement('i');
        this.actionIconClass(action)
          .split(' ')
          .forEach(cls => this.renderer.addClass(icon, cls));
        this.renderer.setAttribute(icon, 'aria-hidden', 'true');
        this.renderer.appendChild(btn, icon);
      }

      // Label (para vertical o compact)
      if (this.direction() === 'vertical' || this.compact()) {
        const label = this.renderer.createElement('span');
        this.renderer.addClass(label, 'menu-item-label');
        const text = this.renderer.createText(action.label);
        this.renderer.appendChild(label, text);
        this.renderer.appendChild(btn, label);
      }

      // Event listener
      const cleanup = this.renderer.listen(btn, 'click', (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        if (!action.disabled && !action.loading) {
          this.actionClick.emit(action.id);
          this.closeMenu(true);
        }
      });
      this.menuListenerCleanups.push(cleanup);

      this.renderer.appendChild(this.menuElement, btn);
    });

    // Añadir al body
    this.renderer.appendChild(this.document.body, this.menuElement);

    this.menuListenerCleanups.push(
      this.renderer.listen(this.menuElement, 'keydown', (event: KeyboardEvent) =>
        this.onMenuKeydown(event),
      ),
    );

    // Calcular posición
    requestAnimationFrame(() => {
      this.updatePosition();
      this.enabledMenuItems()[0]?.focus();
    });
  }

  /** Click en acción visible */
  onActionClick(action: ActionItem): void {
    if (action.disabled || action.loading) return;
    this.actionClick.emit(action.id);
  }



  /** Cerrar menú al hacer clic fuera */
  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Verificar si el click fue fuera del componente Y fuera del menú portal
    const isOutsideComponent = !this.elementRef.nativeElement.contains(target);
    const isOutsideMenu = !this.menuElement || !this.menuElement.contains(target);

    if (isOutsideComponent && isOutsideMenu) {
      this.closeMenu();
    }
  }

  /** Cerrar menú con Escape */
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

  /** Calcular posición óptima del menú (position: fixed) */
  private updatePosition(): void {
    if (!this.menuElement) return;

    const moreBtn = this.elementRef.nativeElement.querySelector('.action-btn--more');
    if (!moreBtn) return;

    const rect = moreBtn.getBoundingClientRect();
    const menuRect = this.menuElement.getBoundingClientRect();
    const menuHeight = menuRect.height || 180;
    const menuWidth = menuRect.width || 160;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.right;

    const preferredPosition = this.menuPosition();
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

    const computeAutoVertical = () => spaceBelow >= menuHeight ? 'bottom' : 'top';
    const computeAutoHorizontal = () => spaceRight >= menuWidth ? 'right' : 'left';

    const positionToUse = preferredPosition === 'auto'
      ? computeAutoVertical()
      : preferredPosition;

    let top: number;
    let left: number;

    switch (positionToUse) {
      case 'top':
        top = rect.top - menuHeight - 4;
        left = rect.left;
        break;
      case 'bottom':
        top = rect.bottom + 4;
        left = rect.left;
        break;
      case 'left':
        top = rect.top + (rect.height - menuHeight) / 2;
        left = rect.left - menuWidth - 4;
        break;
      case 'right':
        top = rect.top + (rect.height - menuHeight) / 2;
        left = rect.right + 4;
        break;
      default: {
        // Fallback: decide vertical first, then horizontal to keep menu visible
        const vertical = computeAutoVertical();
        const horizontal = computeAutoHorizontal();
        top = vertical === 'bottom' ? rect.bottom + 4 : rect.top - menuHeight - 4;
        left = horizontal === 'right' ? rect.right - menuWidth : rect.left;
      }
    }

    // Asegurar que no se salga de la pantalla
    top = clamp(top, 8, window.innerHeight - menuHeight - 8);
    left = clamp(left, 8, window.innerWidth - menuWidth - 8);

    // Aplicar estilos directamente al elemento
    this.renderer.setStyle(this.menuElement, 'top', `${top}px`);
    this.renderer.setStyle(this.menuElement, 'left', `${left}px`);
  }
}
