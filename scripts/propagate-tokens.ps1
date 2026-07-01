# propagate-tokens.ps1
# Uso: .\scripts\propagate-tokens.ps1
# Propaga TODOS los archivos CSS de src/styles/themes/ desde Atomic-UI a Wails y Tauri

$rootDir = Split-Path $PSScriptRoot -Parent
$srcDir  = Join-Path $rootDir "src\styles\themes"

$cssFiles = @(
    "_tokens-primitives.css",
    "_tokens-semantic.css",
    "_tokens-brand.css",
    "_tokens-components.css",
    "_buttons.css",
    "_forms.css",
    "index.css"
)

$destDirs = @(
    (Join-Path $rootDir "..\wails-angular-app\frontend\src\styles\themes"),
    (Join-Path $rootDir "..\tauri-angular-app\src\styles\themes")
)

Write-Host ""
Write-Host "+-----------------------------------------------+" -ForegroundColor Cyan
Write-Host "  ATOMIC-UI - PROPAGACION DE TOKENS (7 CSS)    " -ForegroundColor Cyan
Write-Host "+-----------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

$allOk = $true

foreach ($destDir in $destDirs) {
    if (-not (Test-Path $destDir)) {
        Write-Host "AVISO: Destino no encontrado: $destDir" -ForegroundColor Yellow
        continue
    }
    $label = Split-Path (Split-Path (Split-Path $destDir -Parent) -Parent) -Leaf
    Write-Host "-- $label --" -ForegroundColor Cyan

    foreach ($file in $cssFiles) {
        $src = Join-Path $srcDir $file
        $dst = Join-Path $destDir $file

        if (-not (Test-Path $src)) {
            Write-Host "  ERROR fuente no existe: $file" -ForegroundColor Red
            $allOk = $false
            continue
        }

        $hashSrc = (Get-FileHash $src -Algorithm SHA256).Hash
        Copy-Item $src $dst -Force
        $hashDst = (Get-FileHash $dst -Algorithm SHA256).Hash

        if ($hashSrc -eq $hashDst) {
            Write-Host "  OK $file" -ForegroundColor Green
        } else {
            Write-Host "  HASH MISMATCH $file" -ForegroundColor Red
            $allOk = $false
        }
    }
    Write-Host ""
}

if ($allOk) {
    Write-Host "Propagacion completada (7 archivos x 2 destinos)." -ForegroundColor Green
} else {
    Write-Host "Hubo errores en la propagacion. Revisar destinos." -ForegroundColor Red
    exit 1
}
