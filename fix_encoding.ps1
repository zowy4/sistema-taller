# PowerShell script para corregir codificación de caracteres
$replacements = @{
    'Ã³' = 'ó'
    'Ã­' = 'í'
    'Ã¡' = 'á'
    'Ã©' = 'é'
    'Ãº' = 'ú'
    'Ã±' = 'ñ'
    'Â¿' = '¿'
    'Ã"' = 'Ó'
    'Ã' = 'Í'
    'Ã' = 'Á'
    'Ã‰' = 'É'
    'Ãš' = 'Ú'
    'Ã' = 'Ñ'
    'â€¢' = '•'
    'âœ…' = ''
    'âš ï¸' = ''
    'ðŸ"§' = ''
    'ðŸ'¥' = ''
    'ðŸ—'ï¸' = ''
    'ðŸ"' = ''
    'ðŸ"„' = ''
    'ðŸŽ‰' = ''
    'â‰¡' = ''
    'âœ•' = ''
    'âœï¸' = ''
    'âœ"' = ''
    'âŒ' = ''
    'â³' = ''
    'âž•' = ''
    'ðŸ› ï¸' = ''
    'â†»' = ''
    'â„¹ï¸' = ''
    'â†'' = ''
    'â†' = ''
}

$files = Get-ChildItem -Path "frontend\src" -Include *.tsx,*.ts -Recurse
$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    foreach ($key in $replacements.Keys) {
        $content = $content.Replace($key, $replacements[$key])
    }
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $($file.FullName)"
        $fixedCount++
    }
}

Write-Host "`nTotal files fixed: $fixedCount/$($files.Count)"
