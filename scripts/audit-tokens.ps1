# audit-tokens.ps1
# Uso: .\scripts\audit-tokens.ps1 -ComponentGlob "src\app\shared\ui\atoms\table\*.ts"
param(
    [string]$ComponentGlob = "src\app\shared\ui\**\*.ts"
)

$rootDir = Split-Path $PSScriptRoot -Parent
Push-Location $rootDir

$tokenFiles = @(
    "src\styles\themes\_tokens-components.css",
    "src\styles\themes\_tokens-semantic.css",
    "src\styles\themes\_tokens-primitives.css",
    "src\styles\themes\_tokens-brand.css"
)

# Tokens consumidos por el/los componente(s)
$consumed = Select-String -Path $ComponentGlob -Pattern "var\(--([a-z0-9-]+)" -ErrorAction SilentlyContinue |
    ForEach-Object { $_.Matches | ForEach-Object { $_.Groups[1].Value } } |
    Sort-Object -Unique

# Tokens definidos en el sistema de tokens
$defined = Select-String -Path $tokenFiles -Pattern "^\s+(--[a-z0-9-]+)\s*:" -ErrorAction SilentlyContinue |
    ForEach-Object { $_.Matches.Groups[1].Value } |
    Sort-Object -Unique

$missing = $consumed | Where-Object { $_ -notin $defined }
$ok      = $consumed | Where-Object { $_ -in $defined }

Write-Host ""
Write-Host "+---------------------------------------------+" -ForegroundColor Cyan
Write-Host "¦   ATOMIC-UI — AUDITORÍA DE TOKENS           ¦" -ForegroundColor Cyan
Write-Host "+---------------------------------------------+" -ForegroundColor Cyan
Write-Host "Patrón:          $ComponentGlob"
Write-Host "Tokens pedidos:  $($consumed.Count)"
Write-Host "Tokens OK:       $($ok.Count)" -ForegroundColor Green
Write-Host "Tokens FALTANTES: $($missing.Count)" -ForegroundColor $(if ($missing.Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($missing.Count -gt 0) {
    Write-Host "? TOKENS NO DEFINIDOS (agregar a _tokens-components.css):" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "   --$_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "? Acción requerida: ver CONTRIBUTING_TOKENS.md > Plantilla" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "? Todos los tokens están correctamente definidos." -ForegroundColor Green
    exit 0
}

Pop-Location