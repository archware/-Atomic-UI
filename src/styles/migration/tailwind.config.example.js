/**
 * Configuración Tailwind - Extensión para Sistema de Temas
 * 
 * Agregar este contenido a tu tailwind.config.js existente
 * dentro de theme.extend
 */

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Permite toggle con clase 'dark' en <html>
  theme: {
    extend: {
      colors: {
        // Primary (Púrpura) - Usando variables CSS
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          DEFAULT: 'var(--primary-500)',
        },
        // Secondary (Sky/Azul)
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
          DEFAULT: 'var(--secondary-500)',
        },
        // Brand Accent (Rosa)
        brand: {
          200: 'var(--brand-accent-200)',
          300: 'var(--brand-accent-300)',
          400: 'var(--brand-accent-400)',
          500: 'var(--brand-accent-500)',
        },
        // Superficies
        surface: {
          background: 'var(--surface-background)',
          section: 'var(--surface-section)',
          elevated: 'var(--surface-elevated)',
        },
      },
      textColor: {
        DEFAULT: 'var(--text-color)',
        secondary: 'var(--text-color-secondary)',
        muted: 'var(--text-color-muted)',
        inverse: 'var(--text-color-inverse)',
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
        strong: 'var(--border-color-strong)',
        light: 'var(--border-color-light)',
      },
      boxShadow: {
        // Sombras personalizadas del proyecto
        'custom-menu': 'var(--shadow-menu)',
        'custom-menu-hover': 'var(--shadow-menu-hover)',
        'tabla': 'var(--shadow-tabla)',
        'dropdown': 'var(--shadow-dropdown)',
        // Sombras de elevación
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      ringColor: {
        primary: 'var(--primary-500)',
        focus: 'rgba(121, 53, 118, 0.25)',
      },
      ringOffsetColor: {
        DEFAULT: 'var(--surface-background)',
      },
      backgroundColor: {
        // Fondos de estado
        success: {
          light: 'var(--success-100)',
          DEFAULT: 'var(--success-500)',
        },
        error: {
          light: 'var(--error-100)',
          DEFAULT: 'var(--error-500)',
        },
        warning: {
          light: 'var(--warning-100)',
          DEFAULT: 'var(--warning-500)',
        },
        info: {
          light: 'var(--info-100)',
          DEFAULT: 'var(--info-500)',
        },
      },
    },
  },
  plugins: [],
}
