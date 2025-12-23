#!/usr/bin/env node
/**
 * Atomic UI - Project Generator CLI
 * 
 * Creates new Angular projects with Atomic UI components pre-configured.
 * 
 * Usage:
 *   node tools/create-project.js my-project --template=login+dashboard
 *   node tools/create-project.js my-project --template=full
 * 
 * Templates:
 *   - login: Login page only
 *   - dashboard: Dashboard page only
 *   - crud: CRUD table only
 *   - login+dashboard: Login + Dashboard (default)
 *   - full: All blueprints
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================
// CONFIGURATION
// ============================================

const BLUEPRINTS_DIR = path.join(__dirname, '..', 'src', 'blueprints');
const STYLES_DIR = path.join(__dirname, '..', 'src', 'styles');
const UI_DIR = path.join(__dirname, '..', 'src', 'app', 'shared', 'ui');

const TEMPLATES = {
  'login': ['login'],
  'dashboard': ['dashboard'],
  'crud': ['crud'],
  'login+dashboard': ['login', 'dashboard'],
  'full': ['login', 'dashboard', 'crud']
};

// Map blueprint source folder to destination name
const BLUEPRINT_MAP = {
  'login': 'login-page',
  'dashboard': 'dashboard-page',
  'crud': 'crud-table'
};

// ============================================
// HELPERS
// ============================================

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    step: '👉'
  };
  console.log(`${icons[type] || ''} ${message}`);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    log(`Source not found: ${src}`, 'warning');
    return;
  }

  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Helper functions removed as they are no longer needed


function renameComponentFiles(dir, oldName, newName) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir).forEach(file => {
    if (file.includes(oldName)) {
      const oldPath = path.join(dir, file);
      const newFileName = file.replace(oldName, newName);
      const newPath = path.join(dir, newFileName);

      // Read file, update component selectors and class names
      let content = fs.readFileSync(oldPath, 'utf8');

      // Update selector from app-login-page to app-login
      const oldSelector = oldName;
      const newSelector = newName;
      content = content.replace(
        new RegExp(`selector:\\s*['"]app-${oldSelector}['"]`, 'g'),
        `selector: 'app-${newSelector}'`
      );

      // Update class name from LoginPageComponent to LoginComponent
      const oldClassName = oldName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Component';
      const newClassName = newName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Component';
      content = content.replace(new RegExp(oldClassName, 'g'), newClassName);

      // Update template/style references
      content = content.replace(new RegExp(oldName, 'g'), newName);

      // Remove @fadeSlide animations (not configured by default)
      content = content.replace(/@fadeSlide/g, '');

      fs.writeFileSync(newPath, content, 'utf8');

      // Remove old file if renamed
      if (oldPath !== newPath) {
        fs.unlinkSync(oldPath);
      }
    }
  });
}

// ============================================
// MAIN
// ============================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
╔════════════════════════════════════════════════════════╗
║          Atomic UI - Project Generator                 ║
╚════════════════════════════════════════════════════════╝

Usage:
  npm run create:project <project-name> [options]

Options:
  --template=<name>   Template to use (default: login+dashboard)
                      Available: login, dashboard, crud, login+dashboard, full
  
  --output=<path>     Output directory (default: ../projects)
  
  --skip-install      Skip npm install

Examples:
  npm run create:project my-app
  npm run create:project my-app --template=full
  npm run create:project my-app --output=C:/Projects
    `);
    return;
  }

  const projectName = args[0];
  let template = 'login+dashboard';
  let outputDir = path.join(__dirname, '..', '..', 'projects');
  let skipInstall = false;

  // Parse arguments
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--template=')) {
      template = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      outputDir = arg.split('=')[1];
    } else if (arg === '--skip-install') {
      skipInstall = true;
    }
  });

  if (!TEMPLATES[template]) {
    log(`Unknown template: ${template}`, 'error');
    log(`Available templates: ${Object.keys(TEMPLATES).join(', ')}`, 'info');
    process.exit(1);
  }

  const projectPath = path.join(outputDir, projectName);

  console.log(`
╔════════════════════════════════════════════════════════╗
║          Creating Atomic UI Project                    ║
╚════════════════════════════════════════════════════════╝
  
  Project:  ${projectName}
  Template: ${template}
  Output:   ${projectPath}
  `);

  // Step 1: Create Angular project
  log('Creating Angular project...', 'step');
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    execSync(
      `npx -y @angular/cli@latest new ${projectName} --style=css --routing --skip-install --skip-git`,
      { cwd: outputDir, stdio: 'inherit' }
    );
  } catch (error) {
    log('Failed to create Angular project', 'error');
    process.exit(1);
  }

  // Step 2: Copy UI components
  log('Copying UI components...', 'step');
  const destUI = path.join(projectPath, 'src', 'app', 'shared', 'ui');
  copyRecursive(UI_DIR, destUI);
  log('UI components copied', 'success');

  // Step 3: Copy styles
  log('Copying theme styles...', 'step');
  const destStyles = path.join(projectPath, 'src', 'styles');
  copyRecursive(STYLES_DIR, destStyles);
  log('Styles copied', 'success');

  // Step 4: Copy selected blueprints
  log(`Copying blueprints: ${template}...`, 'step');
  const blueprints = TEMPLATES[template];
  const pagesDir = path.join(projectPath, 'src', 'app', 'pages');

  blueprints.forEach(blueprint => {
    const srcFolder = BLUEPRINT_MAP[blueprint]; // login-page, dashboard-page, etc.
    const src = path.join(BLUEPRINTS_DIR, srcFolder);
    const dest = path.join(pagesDir, blueprint); // login, dashboard, etc.
    copyRecursive(src, dest);

    // Rename component files to match folder name
    renameComponentFiles(dest, srcFolder, blueprint);

    log(`  - ${blueprint}`, 'success');
  });

  // Step 5: Update imports in blueprints - SKIPPED
  // (Blueprints now use @shared/ui alias which is supported by tsconfig)


  // Step 6: Update styles.css
  log('Configuring global styles...', 'step');
  const stylesPath = path.join(projectPath, 'src', 'styles.css');
  const stylesContent = `/* Atomic UI - Global Styles */
@import './styles/themes/index.css';
@import "@fontsource/open-sans/400.css";
@import "@fontsource/open-sans/500.css";
@import "@fontsource/open-sans/600.css";
@import "@fontsource/open-sans/700.css";
@import "@fortawesome/fontawesome-free/css/all.css";

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-family-base);
  background-color: var(--surface-section);
  color: var(--text-color);
}
`;
  fs.writeFileSync(stylesPath, stylesContent, 'utf8');
  log('Global styles configured', 'success');

  // Step 7: Create tsconfig paths
  log('Configuring TypeScript paths...', 'step');
  const tsconfigPath = path.join(projectPath, 'tsconfig.json');
  let tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');

  // Remove comments from JSON (Angular 20+ tsconfig has comments)
  tsconfigContent = tsconfigContent
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
    .replace(/\/\/.*$/gm, '')          // Remove // comments
    .replace(/,(\s*[}\]])/g, '$1');    // Remove trailing commas

  let tsconfig;
  try {
    tsconfig = JSON.parse(tsconfigContent);
  } catch (e) {
    log('Could not parse tsconfig.json, creating paths manually', 'warning');
    // Fallback: append paths directly
    const pathsAddition = `
  // Path aliases for Atomic UI
  "paths": {
    "@shared/ui": ["src/app/shared/ui"],
    "@shared/ui/*": ["src/app/shared/ui/*"]
  }`;
    tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    tsconfigContent = tsconfigContent.replace(
      /"compilerOptions"\s*:\s*\{/,
      `"compilerOptions": {\n    ${pathsAddition},`
    );
    fs.writeFileSync(tsconfigPath, tsconfigContent, 'utf8');
    log('TypeScript paths configured (manual)', 'success');
    return;
  }

  if (!tsconfig.compilerOptions) {
    tsconfig.compilerOptions = {};
  }
  // Add baseUrl for path aliases to work
  tsconfig.compilerOptions.baseUrl = './';
  if (!tsconfig.compilerOptions.paths) {
    tsconfig.compilerOptions.paths = {};
  }
  tsconfig.compilerOptions.paths['@shared/ui'] = ['src/app/shared/ui'];
  tsconfig.compilerOptions.paths['@shared/ui/*'] = ['src/app/shared/ui/*'];

  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2), 'utf8');
  log('TypeScript paths configured', 'success');

  // Step 8: Create sample routes
  log('Creating sample routes...', 'step');
  const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [
${blueprints.includes('login') ? `  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent)
  },` : ''}
${blueprints.includes('dashboard') ? `  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },` : ''}
${blueprints.includes('crud') ? `  {
    path: 'crud',
    loadComponent: () => import('./pages/crud/crud.component')
      .then(m => m.CrudComponent)
  },` : ''}
  {
    path: '',
    redirectTo: '${blueprints.includes('login') ? 'login' : 'dashboard'}',
    pathMatch: 'full'
  }
];
`;
  const routesPath = path.join(projectPath, 'src', 'app', 'app.routes.ts');
  fs.writeFileSync(routesPath, routesContent, 'utf8');
  log('Routes created', 'success');

  // Step 9: Replace default app.html with router outlet
  log('Replacing default app content...', 'step');
  const appHtmlPath = path.join(projectPath, 'src', 'app', 'app.html');
  const appHtmlContent = `<router-outlet></router-outlet>
`;
  fs.writeFileSync(appHtmlPath, appHtmlContent, 'utf8');
  log('App HTML configured', 'success');

  // Step 10: Update app.config.ts with animations
  log('Configuring app providers...', 'step');
  const appConfigPath = path.join(projectPath, 'src', 'app', 'app.config.ts');
  const appConfigContent = `import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(TranslateModule.forRoot())
  ]
};
`;
  fs.writeFileSync(appConfigPath, appConfigContent, 'utf8');
  log('App config updated', 'success');

  // Step 10.5: Update main.ts with zone.js
  log('Configuring main.ts...', 'step');
  const mainPath = path.join(projectPath, 'src', 'main.ts');
  let mainContent = fs.readFileSync(mainPath, 'utf8');
  if (!mainContent.includes("import 'zone.js'")) {
    mainContent = "import 'zone.js';\n" + mainContent;
    fs.writeFileSync(mainPath, mainContent, 'utf8');
  }
  log('Main.ts configured', 'success');

  // Step 11: Install dependencies
  if (!skipInstall) {
    log('Installing dependencies...', 'step');
    try {
      execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
      execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
      execSync('npm install zone.js @fontsource/open-sans @fortawesome/fontawesome-free @ngx-translate/core @ngx-translate/http-loader @angular/animations',
        { cwd: projectPath, stdio: 'inherit' });
      log('Dependencies installed', 'success');
    } catch (error) {
      log('Failed to install dependencies. Run npm install manually.', 'warning');
    }
  }

  // Done!
  console.log(`
╔════════════════════════════════════════════════════════╗
║                   🎉 Project Created!                  ║
╚════════════════════════════════════════════════════════╝

  cd ${projectPath}
  npm start
  
  Open http://localhost:4200 to see your app!
  
  📚 Available pages:
${blueprints.map(b => `     - /${b}`).join('\n')}
  
  🔧 Next steps:
     1. Configure API URL in components
     2. Customize theme in src/styles/themes/_tokens-brand.css
     3. Add your business logic
  `);
}

main();
