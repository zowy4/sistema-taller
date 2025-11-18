# ============================================
# SCRIPTS DE UTILIDAD DOCKER - SISTEMA TALLER
# ============================================

# Colores para output
$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'
$Cyan = 'Cyan'

function Show-Menu {
    Clear-Host
    Write-Host "`n==================================" -ForegroundColor $Cyan
    Write-Host "  SISTEMA TALLER - DOCKER MENU" -ForegroundColor $Cyan
    Write-Host "==================================`n" -ForegroundColor $Cyan
    
    Write-Host "1. Iniciar sistema completo (build + up)" -ForegroundColor $Green
    Write-Host "2. Iniciar sistema (sin rebuild)" -ForegroundColor $Green
    Write-Host "3. Detener sistema" -ForegroundColor $Yellow
    Write-Host "4. Detener y limpiar (borra datos)" -ForegroundColor $Red
    Write-Host "5. Ver logs (todos)" -ForegroundColor $Cyan
    Write-Host "6. Ver logs del backend" -ForegroundColor $Cyan
    Write-Host "7. Ver logs del frontend" -ForegroundColor $Cyan
    Write-Host "8. Ver estado de contenedores" -ForegroundColor $Cyan
    Write-Host "9. Reiniciar backend" -ForegroundColor $Yellow
    Write-Host "10. Reiniciar frontend" -ForegroundColor $Yellow
    Write-Host "11. Acceder a PostgreSQL CLI" -ForegroundColor $Cyan
    Write-Host "12. Backup de base de datos" -ForegroundColor $Green
    Write-Host "0. Salir`n" -ForegroundColor $Red
}

function Start-System {
    Write-Host "`n🚀 Iniciando sistema completo..." -ForegroundColor $Green
    docker-compose up --build -d
    Start-Sleep -Seconds 5
    Show-Status
}

function Start-SystemNoBuild {
    Write-Host "`n🚀 Iniciando sistema..." -ForegroundColor $Green
    docker-compose up -d
    Start-Sleep -Seconds 3
    Show-Status
}

function Stop-System {
    Write-Host "`n⏹️  Deteniendo sistema..." -ForegroundColor $Yellow
    docker-compose down
    Write-Host "✅ Sistema detenido" -ForegroundColor $Green
}

function Stop-SystemClean {
    Write-Host "`n⚠️  ¿Estás seguro? Esto borrará TODOS los datos de la base de datos." -ForegroundColor $Red
    $confirm = Read-Host "Escribe 'SI' para confirmar"
    if ($confirm -eq 'SI') {
        Write-Host "`n🗑️  Limpiando sistema..." -ForegroundColor $Red
        docker-compose down -v
        Write-Host "✅ Sistema limpiado completamente" -ForegroundColor $Green
    } else {
        Write-Host "❌ Operación cancelada" -ForegroundColor $Yellow
    }
}

function Show-Logs {
    Write-Host "`n📋 Logs del sistema (Ctrl+C para salir)..." -ForegroundColor $Cyan
    docker-compose logs -f
}

function Show-BackendLogs {
    Write-Host "`n📋 Logs del backend (Ctrl+C para salir)..." -ForegroundColor $Cyan
    docker-compose logs -f backend
}

function Show-FrontendLogs {
    Write-Host "`n📋 Logs del frontend (Ctrl+C para salir)..." -ForegroundColor $Cyan
    docker-compose logs -f frontend
}

function Show-Status {
    Write-Host "`n📊 Estado de contenedores:" -ForegroundColor $Cyan
    docker-compose ps
    Write-Host ""
    
    # Verificar puertos
    $backend = Get-NetTCPConnection -LocalPort 3002 -State Listen -ErrorAction SilentlyContinue
    $frontend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    $postgres = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue
    
    if ($postgres) { Write-Host "✅ PostgreSQL: http://localhost:5432" -ForegroundColor $Green } else { Write-Host "❌ PostgreSQL: NO RESPONDE" -ForegroundColor $Red }
    if ($backend) { Write-Host "✅ Backend: http://localhost:3002" -ForegroundColor $Green } else { Write-Host "❌ Backend: NO RESPONDE" -ForegroundColor $Red }
    if ($frontend) { Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor $Green } else { Write-Host "❌ Frontend: NO RESPONDE" -ForegroundColor $Red }
    
    if ($backend -and $frontend -and $postgres) {
        Write-Host "`n🎉 Sistema completamente operativo!" -ForegroundColor $Green
        Write-Host "   Accede en: http://localhost:3000`n" -ForegroundColor $Cyan
    }
}

function Restart-Backend {
    Write-Host "`n🔄 Reiniciando backend..." -ForegroundColor $Yellow
    docker-compose restart backend
    Write-Host "✅ Backend reiniciado" -ForegroundColor $Green
}

function Restart-Frontend {
    Write-Host "`n🔄 Reiniciando frontend..." -ForegroundColor $Yellow
    docker-compose restart frontend
    Write-Host "✅ Frontend reiniciado" -ForegroundColor $Green
}

function Access-PostgreSQL {
    Write-Host "`n🐘 Accediendo a PostgreSQL CLI..." -ForegroundColor $Cyan
    Write-Host "   (Escribe '\q' para salir)`n" -ForegroundColor $Yellow
    docker exec -it taller_postgres psql -U postgres -d taller_db
}

function Backup-Database {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFile = "backup_$timestamp.sql"
    
    Write-Host "`n💾 Creando backup de base de datos..." -ForegroundColor $Green
    docker exec taller_postgres pg_dump -U postgres taller_db > $backupFile
    
    if (Test-Path $backupFile) {
        Write-Host "✅ Backup creado: $backupFile" -ForegroundColor $Green
    } else {
        Write-Host "❌ Error al crear backup" -ForegroundColor $Red
    }
}

# Menú principal
do {
    Show-Menu
    $option = Read-Host "Selecciona una opción"
    
    switch ($option) {
        '1' { Start-System }
        '2' { Start-SystemNoBuild }
        '3' { Stop-System }
        '4' { Stop-SystemClean }
        '5' { Show-Logs }
        '6' { Show-BackendLogs }
        '7' { Show-FrontendLogs }
        '8' { Show-Status }
        '9' { Restart-Backend }
        '10' { Restart-Frontend }
        '11' { Access-PostgreSQL }
        '12' { Backup-Database }
        '0' { Write-Host "`n👋 ¡Hasta luego!`n" -ForegroundColor $Green; return }
        default { Write-Host "`n❌ Opción inválida`n" -ForegroundColor $Red }
    }
    
    if ($option -ne '0' -and $option -ne '5' -and $option -ne '6' -and $option -ne '7' -and $option -ne '11') {
        Read-Host "`nPresiona Enter para continuar"
    }
} while ($true)
