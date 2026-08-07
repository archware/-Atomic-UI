/**
 * Auth Guards Blueprint — Archivos de autenticación listos para copiar.
 *
 * INSTRUCCIONES:
 * 1. Copia los archivos de src/app/shared/ui/ que necesites:
 *    - guards/auth.guard.ts
 *    - interceptors/auth.interceptor.ts
 *    - services/auth.service.ts
 *    - services/token.service.ts
 *
 * O impórtalos directamente por su ruta (más recomendado):
 *    import { authGuard } from '@shared/ui/guards/auth.guard';
 *    import { authInterceptor } from '@shared/ui/interceptors/auth.interceptor';
 *    import { AuthService } from '@shared/ui/services/auth.service';
 *    import { TokenService } from '@shared/ui/services/token.service';
 *
 * NOTA: estas piezas son preocupaciones de aplicación y NO forman parte
 * del barrel visual `@shared/ui` ni de la biblioteca `@hra/atomic-ui`.
 *
 * Este archivo es solo el punto de entrada del blueprint.
 * Los archivos reales están en shared/ui para evitar duplicación.
 */

// Re-exportaciones convenientes para este blueprint
export { authGuard, guestGuard, passwordChangeGuard } from '@shared/ui/guards/auth.guard';
export { authInterceptor } from '@shared/ui/interceptors/auth.interceptor';
export { AuthService } from '@shared/ui/services/auth.service';
export { TokenService } from '@shared/ui/services/token.service';
export type { LoginRequest, LoginResponse, UserProfile } from '@shared/ui/services/auth.service';
