#!/usr/bin/env node
/**
 * Atomic UI - Project Generator CLI
 * 
 * Creates new Angular projects with Atomic UI components pre-configured.
 * 
 * Usage:
 *   node tools/create-project.js my-project --template=shell
 * 
 * Templates:
 *   - shell: governed Angular shell without demo or invented domain data
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

// ============================================
// CONFIGURATION
// ============================================

const STYLES_DIR = path.join(__dirname, '..', 'src', 'styles');
const UI_DIR = path.join(__dirname, '..', 'src', 'app', 'shared', 'ui');
const GOVERNANCE_INSTALLER = path.join(__dirname, 'install-consumer-governance.js');
const NODE_INSTALL_ROOT = path.dirname(process.execPath);
const ATOMIC_NODE_MODULES = path.join(__dirname, '..', 'node_modules');
const LOCAL_ANGULAR_CLI_PACKAGE = path.join(ATOMIC_NODE_MODULES, '@angular', 'cli');

const TEMPLATES = {
  'shell': [],
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

function runPackageCli(command, args, options) {
  if (process.platform === 'win32') {
    const cliScript = path.join(NODE_INSTALL_ROOT, 'node_modules', 'npm', 'bin', `${command}-cli.js`);
    if (!fs.existsSync(cliScript)) {
      throw new Error(`${command} CLI not found at ${cliScript}`);
    }
    execFileSync(process.execPath, [cliScript, ...args], options);
    return;
  }
  execFileSync(command, args, options);
}

function runLocalAngularCli(args, options) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-angular-cli-'));
  const temporaryPackage = path.join(temporaryRoot, 'cli');
  try {
    fs.cpSync(LOCAL_ANGULAR_CLI_PACKAGE, temporaryPackage, { recursive: true });
    fs.symlinkSync(ATOMIC_NODE_MODULES, path.join(temporaryRoot, 'node_modules'), 'junction');
    execFileSync(process.execPath, [path.join(temporaryPackage, 'bin', 'ng.js'), ...args], {
      ...options,
    });
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
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
  --template=<name>   Template to use (default: shell)
                      Available: shell
  
  --output=<path>     Output directory (default: ../projects)
  
  --skip-install      Skip npm install

Examples:
  npm run create:project my-app
  npm run create:project my-app --template=shell
  npm run create:project my-app --output=C:/Projects
    `);
    return;
  }

  const projectName = args[0];
  let template = 'shell';
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
    log('Legacy demo blueprints are not published. Use generate:ui with a validated requirement.', 'info');
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(projectName)) {
    log('Project name must start with a letter and contain only lowercase letters, digits, or hyphens.', 'error');
    process.exit(1);
  }

  outputDir = path.resolve(outputDir);
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

    const angularArgs = [
      'new',
      projectName,
      '--style=css',
      '--routing',
      '--skip-install',
      '--skip-git',
    ];
    if (fs.existsSync(LOCAL_ANGULAR_CLI_PACKAGE)) {
      runLocalAngularCli(angularArgs, {
        cwd: outputDir,
        stdio: 'inherit',
      });
    } else {
      runPackageCli(
        'npx',
        ['--yes', '--offline', '--package=@angular/cli@22.0.7', 'ng', ...angularArgs],
        { cwd: outputDir, stdio: 'inherit' },
      );
    }
  } catch (error) {
    log(`Failed to create Angular project: ${error.message}`, 'error');
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

  // Step 3.5: Install the non-optional Atomic-first governance contract
  log('Installing mandatory Atomic governance...', 'step');
  execFileSync(process.execPath, [GOVERNANCE_INSTALLER, projectPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  log('Atomic governance installed', 'success');

  // Demo blueprints remain in Atomic's showcase but are never copied to a consumer.
  log('Creating a production-safe shell without demo data or mocked integrations', 'success');

  // Step 4: Update styles.css
  log('Configuring global styles...', 'step');
  const stylesPath = path.join(projectPath, 'src', 'styles.css');
  const stylesContent = `/* Atomic UI - Global Styles */
@import './styles/themes/index.css';
@import "@fontsource/open-sans/400.css";
@import "@fontsource/open-sans/500.css";
@import "@fontsource/open-sans/600.css";
@import "@fontsource/open-sans/700.css";
@import "@fortawesome/fontawesome-free/css/all.min.css";

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

  // Step 5: Create tsconfig paths
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

  // Step 6: Create an empty route table. Features come from validated requirements.
  log('Creating route table...', 'step');
  const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [];
`;
  const routesPath = path.join(projectPath, 'src', 'app', 'app.routes.ts');
  fs.writeFileSync(routesPath, routesContent, 'utf8');
  log('Routes created', 'success');

  // Step 7: Replace default app.html with router outlet
  log('Replacing default app content...', 'step');
  const appHtmlPath = path.join(projectPath, 'src', 'app', 'app.html');
  const appHtmlContent = `<router-outlet></router-outlet>
`;
  fs.writeFileSync(appHtmlPath, appHtmlContent, 'utf8');
  log('App HTML configured', 'success');

  // Step 8: Configure zoneless application providers
  log('Configuring app providers...', 'step');
  const appConfigPath = path.join(projectPath, 'src', 'app', 'app.config.ts');
  const appConfigContent = `import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(TranslateModule.forRoot())
  ]
};
`;
  fs.writeFileSync(appConfigPath, appConfigContent, 'utf8');
  log('App config updated', 'success');

  // Step 9: Install dependencies
  if (!skipInstall) {
    log('Installing dependencies...', 'step');
    try {
      runPackageCli('npm', ['install'], { cwd: projectPath, stdio: 'inherit' });
      runPackageCli(
        'npm',
        [
          'install',
          '@angular/animations@^22.0.7',
          '@fontsource/open-sans@^5.2.7',
          '@fortawesome/fontawesome-free@^6.4.2',
          '@ngx-translate/core@^17.0.0',
          '@ngx-translate/http-loader@^17.0.0',
          'chart.js@^4.5.1',
          'ng2-charts@^10.0.0',
        ],
        { cwd: projectPath, stdio: 'inherit' },
      );
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
  
  🔧 Next steps:
     1. Describe the UI in a ui-requirement v1 JSON document
     2. From Atomic, preview it with generate:ui -- --spec <file> --output ${projectPath} --dry-run
     3. Generate only after reviewing the plan; then wire real backend contracts
  `);
}

main();
