$path = 'c:\Users\havel.contreras\Documents\Repos\-Atomic-UI\src\app\shared\ui'
$files = Get-ChildItem -Path $path -Recurse -Include *.ts, *.css, *.html

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    if ($content -match '0\.125rem|0\.25rem|0\.375rem|0\.5rem|0\.75rem|1\.25rem|1\.5rem|2rem|3rem|2px|3px|6px|8px|9999px|999px|#fff|rgba\(') {
        
        # Border radius specifics
        $content = $content -replace 'border-radius:\s*9999px', 'border-radius: var(--radius-full)'
        $content = $content -replace 'border-radius:\s*999px', 'border-radius: var(--radius-full)'
        $content = $content -replace 'border-radius:\s*0\.5rem', 'border-radius: var(--radius-md)'
        $content = $content -replace 'border-radius:\s*0\.875rem', 'border-radius: var(--radius-xl)'
        $content = $content -replace 'border-radius:\s*0\.375rem', 'border-radius: var(--radius-sm)'
        $content = $content -replace 'border-radius:\s*3px', 'border-radius: var(--radius-sm)'

        # Spaces/Gaps/Margins/Paddings
        $content = $content -replace '0\.125rem', 'var(--space-1)'
        $content = $content -replace '0\.25rem', 'var(--space-1)'
        $content = $content -replace '0\.375rem', 'var(--space-2)'
        $content = $content -replace '0\.5rem', 'var(--space-2)'
        $content = $content -replace '0\.75rem', 'var(--space-3)'
        $content = $content -replace '1rem', 'var(--space-4)'
        $content = $content -replace '1\.25rem', 'var(--space-5)' 
        $content = $content -replace '1\.5rem', 'var(--space-5)'
        $content = $content -replace '2rem', 'var(--space-6)'
        $content = $content -replace '2\.25rem', 'var(--space-7)'
        $content = $content -replace '2\.75rem', 'var(--space-11)'
        $content = $content -replace '3rem', 'var(--space-8)'

        # Px spaces
        $content = $content -replace '2px', 'var(--space-1)'
        $content = $content -replace '3px', 'var(--space-1)'
        $content = $content -replace '6px', 'var(--space-2)'
        $content = $content -replace '8px', 'var(--space-2)'

        # Colors (Navbar / Spinner)
        $content = $content -replace 'rgba\(255,255,255,\.15\)', 'var(--hover-background-subtle)'
        $content = $content -replace 'rgba\(255,255,255,\.1\)', 'var(--hover-background-subtle)'
        $content = $content -replace 'rgba\(255,255,255,\.25\)', 'var(--button-primary-bg-hover)'
        $content = $content -replace 'rgba\(255,255,255,\.3\)', 'var(--border-color)'
        $content = $content -replace '#fff', 'var(--gray-0)'

        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}
