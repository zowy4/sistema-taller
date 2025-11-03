$rootPath = "C:\Users\zowya\OneDrive\Escritorio\zowy\PortafolioWeb\formulario-react\sistema_taller"

$files = Get-ChildItem -Path $rootPath -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.mjs -File | Where-Object {
    $_.FullName -notmatch 'node_modules|\.next|dist|build|next-env\.d\.ts'
}

$totalProcessed = 0
$totalModified = 0

foreach ($file in $files) {
    $totalProcessed++
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $modified = $false
    
    $lines = $content -split "`n"
    $newLines = @()
    
    foreach ($line in $lines) {
        $trimmedLine = $line.Trim()
        
        $shouldRemove = $false
        
        if ($trimmedLine -match '^//\s*(Permisos de|Admin:|Supervisor:|Técnico:|Recepción:|Crear|Asignar|old |Validación|Redirigir|Verificar|Si |Estados|Función|Este|Mostrar|Página|Actualizar|Token|Nota:|Eliminar|Obtener|Lógica|Calcular|Usar|Cantidad|El helper|Normaliza|Use the|Log server|Definimos|Los clientes|Para empleados|Agregar|Prisma|Ventas|Facturas|Ordenes|Últimos|1\.|2\.|3\.|4\.|@Permissions|import \{|Nuevo endpoint|Default)') {
            $shouldRemove = $true
        }
        
        if ($trimmedLine -match '^//\s*-+$') {
            $shouldRemove = $true
        }
        
        if ($shouldRemove) {
            $modified = $true
        } else {
            $newLines += $line
        }
    }
    
    if ($modified) {
        $newContent = ($newLines -join "`n").TrimEnd() + "`n"
        
        while ($newContent -match '\n\n\n') {
            $newContent = $newContent -replace '\n\n\n', "`n`n"
        }
        
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        $totalModified++
        Write-Host "✓ Limpiado: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Procesamiento completado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Archivos procesados: $totalProcessed" -ForegroundColor White
Write-Host "Archivos modificados: $totalModified" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
