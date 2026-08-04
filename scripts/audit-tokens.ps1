# audit-tokens.ps1
# Audita tokens consumidos por CSS, SCSS, TypeScript y HTML contra las definiciones del tema.
[CmdletBinding()]
param(
    [string[]]$ComponentGlob = @('src/app/shared/ui'),
    [string[]]$TokenFiles = @(),
    [string]$RootDir = '',
    [switch]$Json
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Normalize-Path {
    param([Parameter(Mandatory = $true)][string]$Path)
    return $Path.Replace('\', '/')
}

function Get-AbsolutePattern {
    param(
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$BaseRoot
    )
    if ([System.IO.Path]::IsPathRooted($Pattern)) {
        return [System.IO.Path]::GetFullPath($Pattern)
    }
    return [System.IO.Path]::GetFullPath((Join-Path $BaseRoot $Pattern))
}

function Resolve-AuditFiles {
    param(
        [Parameter(Mandatory = $true)][string[]]$Patterns,
        [Parameter(Mandatory = $true)][string]$BaseRoot,
        [Parameter(Mandatory = $true)][string[]]$Extensions
    )

    $resolved = New-Object System.Collections.Generic.List[string]
    foreach ($patternValue in $Patterns) {
        if ([string]::IsNullOrWhiteSpace($patternValue)) { continue }
        $absolutePattern = Get-AbsolutePattern -Pattern $patternValue -BaseRoot $BaseRoot
        $containsWildcard = $absolutePattern.IndexOfAny([char[]]'*?[') -ge 0

        if (-not $containsWildcard) {
            if (Test-Path -LiteralPath $absolutePattern -PathType Leaf) {
                if ($Extensions -contains ([System.IO.Path]::GetExtension($absolutePattern).ToLowerInvariant())) {
                    $resolved.Add([System.IO.Path]::GetFullPath($absolutePattern))
                }
                continue
            }
            if (Test-Path -LiteralPath $absolutePattern -PathType Container) {
                Get-ChildItem -LiteralPath $absolutePattern -Recurse -File |
                    Where-Object { $Extensions -contains $_.Extension.ToLowerInvariant() } |
                    ForEach-Object { $resolved.Add($_.FullName) }
                continue
            }
            throw "Ruta de auditoria inexistente: $patternValue"
        }

        $normalizedPattern = Normalize-Path -Path $absolutePattern
        $wildcardPosition = $normalizedPattern.IndexOfAny([char[]]'*?[')
        $prefix = $normalizedPattern.Substring(0, $wildcardPosition)
        $separatorPosition = $prefix.LastIndexOf('/')
        $searchRoot = if ($separatorPosition -ge 0) { $prefix.Substring(0, $separatorPosition) } else { $BaseRoot }
        if (-not (Test-Path -LiteralPath $searchRoot -PathType Container)) {
            throw "La raiz del patron no existe: $patternValue"
        }
        $likePattern = $normalizedPattern.Replace('**', '*')
        Get-ChildItem -LiteralPath $searchRoot -Recurse -File |
            Where-Object {
                ($Extensions -contains $_.Extension.ToLowerInvariant()) -and
                ((Normalize-Path -Path $_.FullName) -like $likePattern)
            } |
            ForEach-Object { $resolved.Add($_.FullName) }
    }
    return @($resolved | Sort-Object -Unique)
}

function Relative-AuditPath {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$BaseRoot
    )
    $rootWithSeparator = $BaseRoot.TrimEnd([char[]]@('\', '/')) + [System.IO.Path]::DirectorySeparatorChar
    $rootUri = New-Object System.Uri($rootWithSeparator)
    $pathUri = New-Object System.Uri([System.IO.Path]::GetFullPath($Path))
    return Normalize-Path -Path ([System.Uri]::UnescapeDataString($rootUri.MakeRelativeUri($pathUri).ToString()))
}

try {
    $scriptRoot = Split-Path $PSScriptRoot -Parent
    $effectiveRoot = if ([string]::IsNullOrWhiteSpace($RootDir)) { $scriptRoot } else { $RootDir }
    $effectiveRoot = (Resolve-Path -LiteralPath $effectiveRoot).Path
    $sourceExtensions = @('.css', '.scss', '.ts', '.html')
    $tokenExtensions = @('.css', '.scss')

    $sourceFiles = @(Resolve-AuditFiles -Patterns $ComponentGlob -BaseRoot $effectiveRoot -Extensions $sourceExtensions)
    if ($sourceFiles.Count -eq 0) {
        throw 'El patron no encontro archivos CSS, SCSS, TypeScript o HTML para auditar.'
    }

    if ($TokenFiles.Count -eq 0) {
        $defaultTokenRoot = Join-Path $effectiveRoot 'src/styles/themes'
        if (-not (Test-Path -LiteralPath $defaultTokenRoot -PathType Container)) {
            throw "No existe el directorio de tokens: $defaultTokenRoot"
        }
        $resolvedTokenFiles = @(Resolve-AuditFiles -Patterns @($defaultTokenRoot) -BaseRoot $effectiveRoot -Extensions $tokenExtensions)
    } else {
        $resolvedTokenFiles = @(Resolve-AuditFiles -Patterns $TokenFiles -BaseRoot $effectiveRoot -Extensions $tokenExtensions)
    }
    if ($resolvedTokenFiles.Count -eq 0) {
        throw 'No se encontraron archivos CSS o SCSS con definiciones de tokens.'
    }

    $tokenFileSet = @{}
    foreach ($tokenFile in $resolvedTokenFiles) { $tokenFileSet[$tokenFile.ToLowerInvariant()] = $true }
    $sourceFiles = @($sourceFiles | Where-Object { -not $tokenFileSet.ContainsKey($_.ToLowerInvariant()) })
    if ($sourceFiles.Count -eq 0) {
        throw 'Todos los archivos fuente seleccionados son archivos de definicion de tokens.'
    }

    $definitionPattern = [regex]::new('(?m)(--[a-z0-9-]+)\s*:', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $styleBindingPattern = [regex]::new('\[style\.(--[a-z0-9-]+)(?:\.[a-z0-9-]+)?\]', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $setPropertyPattern = [regex]::new('\bsetProperty\s*\(\s*["''](--[a-z0-9-]+)["'']', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $rendererSetStylePattern = [regex]::new('\bsetStyle\s*\([^,]+,\s*["''](--[a-z0-9-]+)["'']', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $consumptionPattern = [regex]::new('var\(\s*(--[a-z0-9-]+)(?<fallback>\s*,)?', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $defined = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    $themeDefined = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    $sourceDefined = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

    foreach ($tokenFile in $resolvedTokenFiles) {
        $content = [System.IO.File]::ReadAllText($tokenFile)
        foreach ($match in $definitionPattern.Matches($content)) {
            $token = $match.Groups[1].Value.ToLowerInvariant()
            [void]$defined.Add($token)
            [void]$themeDefined.Add($token)
        }
    }

    $sourceContentByFile = @{}
    foreach ($sourceFile in $sourceFiles) {
        $content = [System.IO.File]::ReadAllText($sourceFile)
        $sourceContentByFile[$sourceFile] = $content
        foreach ($pattern in @($definitionPattern, $styleBindingPattern, $setPropertyPattern, $rendererSetStylePattern)) {
            foreach ($match in $pattern.Matches($content)) {
                $token = $match.Groups[1].Value.ToLowerInvariant()
                [void]$defined.Add($token)
                [void]$sourceDefined.Add($token)
            }
        }
    }

    $occurrences = @()
    foreach ($sourceFile in $sourceFiles) {
        $content = $sourceContentByFile[$sourceFile]
        foreach ($match in $consumptionPattern.Matches($content)) {
            $line = 1 + ([regex]::Matches($content.Substring(0, $match.Index), "`n")).Count
            $occurrences += [pscustomobject]@{
                token = $match.Groups[1].Value.ToLowerInvariant()
                location = "$(Relative-AuditPath -Path $sourceFile -BaseRoot $effectiveRoot):$line"
                required = -not $match.Groups['fallback'].Success
            }
        }
    }

    $consumed = @($occurrences | ForEach-Object { $_.token } | Sort-Object -Unique)
    $required = @($occurrences | Where-Object { $_.required } | ForEach-Object { $_.token } | Sort-Object -Unique)
    $fallbackProtected = @($consumed | Where-Object { $_ -notin $required })
    $missing = @()
    foreach ($token in $required) {
        if (-not $defined.Contains($token)) {
            $locations = @($occurrences | Where-Object { $_.token -eq $token -and $_.required } | ForEach-Object { $_.location } | Sort-Object -Unique)
            $missing += [pscustomobject]@{ token = $token; locations = $locations }
        }
    }

    $result = [ordered]@{
        schemaVersion = 1
        valid = $missing.Count -eq 0
        scannedFiles = $sourceFiles.Count
        tokenFiles = $resolvedTokenFiles.Count
        consumed = $consumed.Count
        required = $required.Count
        fallbackProtected = $fallbackProtected.Count
        defined = $defined.Count
        themeDefined = $themeDefined.Count
        sourceDefined = $sourceDefined.Count
        missing = $missing
    }

    if ($Json) {
        $result | ConvertTo-Json -Depth 6 -Compress
    } else {
        Write-Output "TOKEN_AUDIT valid=$($result.valid) scanned=$($result.scannedFiles) tokenFiles=$($result.tokenFiles) consumed=$($result.consumed) required=$($result.required) fallback=$($result.fallbackProtected) defined=$($result.defined) missing=$($missing.Count)"
        foreach ($entry in $missing) {
            Write-Output "- $($entry.token): $($entry.locations -join ', ')"
        }
    }

    if ($missing.Count -gt 0) { exit 1 }
    exit 0
} catch {
    if ($Json) {
        [ordered]@{
            schemaVersion = 1
            valid = $false
            error = $_.Exception.Message
            line = $_.InvocationInfo.ScriptLineNumber
        } | ConvertTo-Json -Compress
    } else {
        Write-Error $_.Exception.Message
    }
    exit 2
}
