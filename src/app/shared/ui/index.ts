/**
 * UI Component Library - Barrel Exports
 * 
 * Importar componentes desde aquí:
 * import { AvatarComponent, ChipComponent } from '@shared/ui';
 * 
 * Configurar path alias en tsconfig.json:
 * "paths": { "@shared/ui": ["src/app/shared/ui"] }
 */

// ============================================
// ATOMS - Componentes básicos indivisibles
// ============================================
export { AvatarComponent } from './atoms/avatar/avatar.component';
export type { AvatarSize, AvatarStatus } from './atoms/avatar/avatar.component';

export { ButtonComponent } from './atoms/button/button.component';

export { CheckboxComponent } from './atoms/checkbox/checkbox.component';

export { ChipComponent } from './atoms/chip/chip.component';
export type { ChipVariant, ChipSize } from './atoms/chip/chip.component';

export { DividerComponent } from './atoms/divider/divider.component';

export { FloatingInputComponent } from './atoms/floating-input/floating-input.component';
export type { FloatingInputType, FloatingInputVariant } from './atoms/floating-input/floating-input.component';

export { FormErrorComponent } from './atoms/form-error/form-error.component';
export { FormRowComponent } from './atoms/form-row/form-row.component';

export { IconButtonComponent } from './atoms/icon-button/icon-button.component';

export { InputComponent } from './atoms/input/input.component';

export { LanguageSwitcherComponent } from './atoms/language-switcher/language-switcher.component';
export type { Language } from './atoms/language-switcher/language-switcher.component';

export { LoaderComponent } from './atoms/loader/loader.component';
export type { LoaderVariant, LoaderSize } from './atoms/loader/loader.component';

export { RatingComponent } from './atoms/rating/rating.component';

export { RowComponent } from './atoms/row/row.component';

export { SelectComponent } from './atoms/select/select.component';

export { SkeletonComponent } from './atoms/skeleton/skeleton.component';

export { TextComponent } from './atoms/text/text.component';

export { ToggleComponent } from './atoms/toggle/toggle.component';

export { TableComponent } from './atoms/table/table.component';
export { TableHeadComponent } from './atoms/table/table-head.component';
export { TableRowComponent } from './atoms/table/table-row.component';
export { TableCellComponent } from './atoms/table/table-cell.component';

// ============================================
// MOLECULES - Combinación de átomos
// ============================================
export { DatepickerComponent } from './molecules/datepicker/datepicker.component';

export { DropdownComponent } from './molecules/dropdown/dropdown.component';
export type { DropdownOption } from './molecules/dropdown/dropdown.component';

export { ModalComponent } from './molecules/modal/modal.component';

export { PaginationComponent } from './molecules/pagination/pagination.component';

export { Select2Component } from './molecules/select2/select2.component';
export type { Select2Option } from './molecules/select2/select2.component';

export { TableActionsComponent } from './molecules/table-actions/table-actions.component';

export { ToastComponent } from './molecules/toast/toast.component';
export type { ToastConfig, ToastType } from './molecules/toast/toast.component';

export { UserMenuComponent } from './molecules/user-menu/user-menu.component';

// ============================================
// ORGANISMS - Estructuras complejas
// ============================================
export { AccordionComponent, AccordionItemComponent } from './organisms/accordion/accordion.component';

export { FiltersComponent } from './organisms/filters/filters.component';

export { FooterComponent } from './organisms/footer/footer.component';
export type { SocialLink, LegalLink, FooterVariant } from './organisms/footer/footer.component';

export { ScrollOverlayComponent } from './organisms/scroll-overlay/scroll-overlay.component';

export { SidebarComponent } from './organisms/sidebar/sidebar.component';
export type { SidebarUser, SidebarMenuItem } from './organisms/sidebar/sidebar.component';

export { StepperComponent } from './organisms/stepper/stepper.component';
export type { Step } from './organisms/stepper/stepper.component';

export { TabsComponent, TabComponent } from './organisms/tabs/tabs.component';

export { ThemeSwitcherComponent } from './organisms/theme-switcher/theme-switcher.component';

export { TopbarComponent } from './organisms/topbar/topbar.component';

// ============================================
// SURFACES
// ============================================
export { PanelComponent } from './surfaces/panel/panel.component';

// ============================================
// TEMPLATES
// ============================================
export { LayoutShellComponent } from './templates/layout-shell/layout-shell.component';

export { AuthLayoutComponent } from './templates/auth-layout/auth-layout.component';

// ============================================
// SERVICES
// ============================================
export { ThemeService } from './services/theme.service';

export { ValidationService, DEFAULT_VALIDATION_MESSAGES } from './services/validation.service';
export type { ValidationMessage } from './services/validation.service';

export { ApiService } from './services/api.service';
export type { ApiRequestOptions, ApiResponse, ApiError } from './services/api.service';

export { useApi, UseApiService } from './services/use-api.service';
export type { ApiState, UseApiResult } from './services/use-api.service';

// ============================================
// DATA MANAGEMENT
// ============================================
export { DataStateComponent } from './molecules/data-state/data-state.component';

