[CmdletBinding()]
param()

# El nombre histórico del script se conserva para no romper automatizaciones.
# La operación es deliberadamente de solo lectura mientras los consumidores
# mantengan adaptaciones documentadas respecto de la fuente Atomic.

$atomicRoot = Split-Path $PSScriptRoot -Parent
$sourceDirectory = Join-Path $atomicRoot 'src\styles\themes'

$themeFiles = @(
    '_tokens-primitives.css',
    '_tokens-semantic.css',
    '_tokens-brand.css',
    '_tokens-components.css',
    '_buttons.css',
    '_forms.css',
    '_utilities.css',
    'index.css'
)

$consumerDefinitions = @(
    @{
        Name = 'Python'
        Directory = Join-Path $atomicRoot '..\base_python_angular\frontend\src\styles\themes'
    },
    @{
        Name = 'Tauri'
        Directory = Join-Path $atomicRoot '..\base_tauri_angular\src\styles\themes'
    },
    @{
        Name = 'Wails'
        Directory = Join-Path $atomicRoot '..\base_wails_angular\frontend\src\styles\themes'
    }
)

$preflightErrors = [System.Collections.Generic.List[string]]::new()
$divergences = [System.Collections.Generic.List[string]]::new()
$exactCounts = @{}

Write-Host ''
Write-Host '+----------------------------------------------------------+' -ForegroundColor Cyan
Write-Host '  ATOMIC UI - AUDITORÍA SEGURA DE ARCHIVOS DE TEMA       ' -ForegroundColor Cyan
Write-Host '+----------------------------------------------------------+' -ForegroundColor Cyan
Write-Host ''

if (-not (Test-Path -LiteralPath $sourceDirectory -PathType Container)) {
    $preflightErrors.Add("No existe el directorio fuente: $sourceDirectory")
}

foreach ($themeFile in $themeFiles) {
    $sourcePath = Join-Path $sourceDirectory $themeFile
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        $preflightErrors.Add("No existe el archivo fuente: $sourcePath")
    }
}

foreach ($consumerDefinition in $consumerDefinitions) {
    $consumerDirectory = [string]$consumerDefinition.Directory
    if (-not (Test-Path -LiteralPath $consumerDirectory -PathType Container)) {
        $preflightErrors.Add(
            "No existe el directorio del consumidor $($consumerDefinition.Name): $consumerDirectory"
        )
    }
}

if ($preflightErrors.Count -gt 0) {
    foreach ($preflightError in $preflightErrors) {
        Write-Host "ERROR: $preflightError" -ForegroundColor Red
    }
    exit 1
}

foreach ($consumerDefinition in $consumerDefinitions) {
    $consumerName = [string]$consumerDefinition.Name
    $consumerDirectory = [string]$consumerDefinition.Directory
    $exactCounts[$consumerName] = 0

    Write-Host "-- $consumerName --" -ForegroundColor Cyan

    foreach ($themeFile in $themeFiles) {
        $sourcePath = Join-Path $sourceDirectory $themeFile
        $destinationPath = Join-Path $consumerDirectory $themeFile

        if (-not (Test-Path -LiteralPath $destinationPath -PathType Leaf)) {
            $divergences.Add("$consumerName|$themeFile|ausente")
            Write-Host "  AUSENTE    $themeFile" -ForegroundColor Yellow
            continue
        }

        $sourceHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
        $destinationHash = (Get-FileHash -LiteralPath $destinationPath -Algorithm SHA256).Hash

        if ($sourceHash -eq $destinationHash) {
            $exactCounts[$consumerName]++
            Write-Host "  EXACTO     $themeFile" -ForegroundColor Green
        } else {
            $divergences.Add("$consumerName|$themeFile|adaptado")
            Write-Host "  ADAPTADO   $themeFile" -ForegroundColor Yellow
        }
    }

    Write-Host ''
}

Write-Host 'Resumen:' -ForegroundColor Cyan
foreach ($consumerDefinition in $consumerDefinitions) {
    $consumerName = [string]$consumerDefinition.Name
    Write-Host "  ${consumerName}: $($exactCounts[$consumerName])/$($themeFiles.Count) archivos exactos"
}

if ($divergences.Count -gt 0) {
    Write-Host ''
    Write-Host (
        'No se realizó ninguna copia. Las divergencias requieren una migración ' +
        'Atomic-first revisada y una decisión de adaptación por consumidor.'
    ) -ForegroundColor Yellow
    exit 2
}

Write-Host ''
Write-Host 'Los archivos de tema coinciden en todos los consumidores.' -ForegroundColor Green
