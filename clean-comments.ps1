$rootPath = "C:\Users\zowya\OneDrive\Escritorio\zowy\PortafolioWeb\formulario-react\sistema_taller"

$files = Get-ChildItem -Path $rootPath -Recurse -Include *.ts,*.tsx,*.js,*.jsx -File | Where-Object {
    $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch '\.next' -and $_.FullName -notmatch 'dist' -and $_.FullName -notmatch 'build' -and $_.FullName -notmatch 'next-env.d.ts'
}

$totalProcessed = 0
$totalModified = 0

foreach ($file in $files) {
    $totalProcessed++
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalLength = $content.Length
    
    $lines = $content -split "`r`n|`n"
    $newLines = @()
    
    foreach ($line in $lines) {
        $keep = $true
        
        if ($line -match '^\s*//\s*(Permisos de|Admin:|Supervisor:|Crear|Asignar|old |Validación|Redirigir|Estados|Función|Este|Mostrar|Página|Actualizar|Token|Nota:|Eliminar|Obtener|Calcular|Usar|El helper|Normaliza|Definimos|Los clientes|Para empleados|Agregar|Ventas|Facturas|Ordenes|Últimos|@Permissions|import \{|Nuevo endpoint|Default|Verificar|Si no|Lógica|Cantidad)') {
            $keep = $false
        }
        
        if ($line -match '^\s*//\s*\d+\.') {
            $keep = $false
        }
        
        if ($keep) {
            $newLines += $line
        }
    }
    
    if ($newLines.Count -lt $lines.Count) {
        $newContent = ($newLines -join "`n") + "`n"
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        $totalModified++
        Write-Host "Limpiado: $($file.Name)"
    }
}

Write-Host "Procesados: $totalProcessed"
Write-Host "Modificados: $totalModified"
