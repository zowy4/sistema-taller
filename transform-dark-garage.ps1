# Script para transformar todas las páginas administrativas al estilo Dark Garage Industrial
# Autor: GitHub Copilot
# Fecha: 2025-12-07

$files = @(
    "frontend\src\app\admin\inventory\page.tsx",
    "frontend\src\app\admin\proveedores\page.tsx",
    "frontend\src\app\admin\empleados\page.tsx",
    "frontend\src\app\admin\compras\page.tsx",
    "frontend\src\app\admin\facturas\page.tsx",
    "frontend\src\app\admin\alertas\page.tsx",
    "frontend\src\app\admin\reportes\page.tsx"
)

Write-Host "🎨 Iniciando transformación al estilo Dark Garage Industrial..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "📝 Procesando: $file" -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Transformaciones de fondos
        $content = $content -replace 'bg-white(?!\-)', 'bg-[#1a1a1a] border border-gray-800'
        $content = $content -replace 'bg-gray-50', 'bg-[#0f0f0f]'
        $content = $content -replace 'bg-gray-100', 'bg-[#1a1a1a] border border-gray-800'
        $content = $content -replace 'bg-gradient-to-br from-gray-50 to-gray-100', 'bg-[#0f0f0f]'
        
        # Transformaciones de texto
        $content = $content -replace 'text-gray-900', 'text-white'
        $content = $content -replace 'text-gray-800', 'text-white'
        $content = $content -replace 'text-gray-700', 'text-gray-400'
        $content = $content -replace 'text-gray-600', 'text-gray-400'
        $content = $content -replace 'text-gray-500', 'text-gray-500'
        
        # Transformaciones de badges y tags (orden importa)
        $content = $content -replace 'bg-blue-100 text-blue-700', 'bg-blue-600/20 border border-blue-600 text-blue-500'
        $content = $content -replace 'bg-blue-100 text-blue-800', 'bg-blue-600/20 border border-blue-600 text-blue-500'
        $content = $content -replace 'bg-green-100 text-green-700', 'bg-green-600/20 border border-green-600 text-green-500'
        $content = $content -replace 'bg-green-100 text-green-800', 'bg-green-600/20 border border-green-600 text-green-500'
        $content = $content -replace 'bg-yellow-100 text-yellow-700', 'bg-yellow-600/20 border border-yellow-600 text-yellow-500'
        $content = $content -replace 'bg-yellow-100 text-yellow-800', 'bg-yellow-600/20 border border-yellow-600 text-yellow-500'
        $content = $content -replace 'bg-red-100 text-red-700', 'bg-red-600/20 border border-red-600 text-red-500'
        $content = $content -replace 'bg-red-100 text-red-800', 'bg-red-600/20 border border-red-600 text-red-500'
        $content = $content -replace 'bg-purple-100 text-purple-700', 'bg-orange-600/20 border border-orange-600 text-orange-500'
        $content = $content -replace 'bg-purple-100 text-purple-800', 'bg-orange-600/20 border border-orange-600 text-orange-500'
        $content = $content -replace 'bg-gray-100 text-gray-700', 'bg-gray-600/20 border border-gray-600 text-gray-500'
        $content = $content -replace 'bg-gray-100 text-gray-800', 'bg-gray-600/20 border border-gray-600 text-gray-500'
        
        # Transformaciones de backgrounds solos
        $content = $content -replace 'bg-blue-100(?! )', 'bg-blue-600/20 border border-blue-600'
        $content = $content -replace 'bg-green-100(?! )', 'bg-green-600/20 border border-green-600'
        $content = $content -replace 'bg-yellow-100(?! )', 'bg-yellow-600/20 border border-yellow-600'
        $content = $content -replace 'bg-red-100(?! )', 'bg-red-600/20 border border-red-600'
        $content = $content -replace 'bg-purple-100(?! )', 'bg-orange-600/20 border border-orange-600'
        
        # Transformaciones de headers de tabla
        $content = $content -replace 'bg-gray-200', 'bg-[#2d2d2d] border-b border-gray-800'
        $content = $content -replace 'thead className="bg-gray-50"', 'thead className="bg-[#2d2d2d] border-b border-gray-800"'
        
        # Transformaciones de hover
        $content = $content -replace 'hover:bg-gray-100', 'hover:bg-[#2d2d2d]'
        $content = $content -replace 'hover:bg-gray-50', 'hover:bg-[#2d2d2d]'
        
        # Transformaciones de botones azules/morados a naranja
        $content = $content -replace 'bg-blue-600 hover:bg-blue-700 text-white', 'bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 text-white hover:from-orange-500 hover:to-orange-400'
        $content = $content -replace 'bg-blue-500 text-white.*?hover:bg-blue-600', 'bg-orange-600/20 border border-orange-600 text-orange-500 hover:bg-orange-600/30'
        $content = $content -replace 'bg-purple-600 text-white', 'bg-blue-600/20 border border-blue-600 text-blue-500'
        
        # Transformaciones de font-bold a font-black para títulos
        $content = $content -replace '(h[1-6] className=".*?)font-bold(.*?")', '$1font-black$2'
        $content = $content -replace '(h[1-6] className=".*?)font-semibold(.*?")', '$1font-black$2'
        
        # Transformaciones de bordes redondeados
        $content = $content -replace 'rounded-2xl', ''
        $content = $content -replace 'rounded-xl', ''
        $content = $content -replace 'rounded-lg', ''
        $content = $content -replace 'rounded-full', ''
        
        # Guardar archivo
        Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
        
        Write-Host "   ✅ Completado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Archivo no encontrado: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Transformación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos transformados:" -ForegroundColor Cyan
foreach ($file in $files) {
    Write-Host "  • $file" -ForegroundColor Gray
}
