$files = Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx -Recurse -File | Where-Object { $_.FullName -notmatch 'node_modules' }
$count = 0

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $cleaned = @()
    $inMultiLineComment = $false
    
    foreach ($line in $lines) {
        if ($inMultiLineComment) {
            if ($line -match '\*/') {
                $inMultiLineComment = $false
                $line = $line -replace '.*\*/', ''
            }
            if ($line.Trim() -eq '') { continue }
        }
        
        if ($line -match '/\*' -and $line -notmatch '\*/') {
            $inMultiLineComment = $true
            $line = $line -replace '/\*.*', ''
        }
        
        if ($line -match '/\*.*\*/') {
            $line = $line -replace '/\*.*\*/', ''
        }
        
        $line = $line -replace '//.*$', ''
        
        if ($line.Trim() -ne '') {
            $cleaned += $line
        }
    }
    
    $content = $cleaned -join "`n"
    $content | Set-Content -Path $file.FullName -Encoding UTF8
    $count++
}

Write-Host "`n$count archivos procesados" -ForegroundColor Green
