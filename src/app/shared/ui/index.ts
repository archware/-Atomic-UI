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

export { ChipComponent } from './atoms/chip/chip.component';
export type { ChipVariant, ChipSize } from './atoms/chip/chip.component';

export { SkeletonComponent } from './atoms/skeleton/skeleton.component';

export { RatingComponent } from './atoms/rating/rating.component';

export { LoaderComponent } from './atoms/loader/loader.component';
export type { LoaderVariant, LoaderSize } from './atoms/loader/loader.component';

export { LanguageSwitcherComponent } from './atoms/language-switcher/language-switcher.component';
export type { Language } from './atoms/language-switcher/language-switcher.component';

// ============================================
// MOLECULES - Combinación de átomos
// ============================================
export { DropdownComponent } from './molecules/dropdown/dropdown.component';
export type { DropdownOption } from './molecules/dropdown/dropdown.component';

export { PaginationComponent } from './molecules/pagination/pagination.component';

export { ToastComponent } from './molecules/toast/toast.component';
export type { ToastConfig, ToastType } from './molecules/toast/toast.component';

// ============================================
// ORGANISMS - Estructuras complejas
// ============================================
export { TabsComponent, TabComponent } from './organisms/tabs/tabs.component';

export { AccordionComponent, AccordionItemComponent } from './organisms/accordion/accordion.component';

export { StepperComponent } from './organisms/stepper/stepper.component';
export type { Step } from './organisms/stepper/stepper.component';

export { ScrollOverlayComponent } from './organisms/scroll-overlay/scroll-overlay.component';

export { ThemeSwitcherComponent } from './organisms/theme-switcher/theme-switcher.component';

// ============================================
// SERVICES
// ============================================
export { ThemeService } from './services/theme.service';

export { ValidationService, DEFAULT_VALIDATION_MESSAGES } from './services/validation.service';
export type { ValidationMessage } from './services/validation.service';

// ============================================
// FORM COMPONENTS
// ============================================
export { FormErrorComponent } from './atoms/form-error/form-error.component';
