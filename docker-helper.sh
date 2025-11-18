#!/bin/bash

# ============================================
# SCRIPTS DE UTILIDAD DOCKER - SISTEMA TALLER
# ============================================

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_menu() {
    clear
    echo -e "${CYAN}"
    echo "=================================="
    echo "  SISTEMA TALLER - DOCKER MENU"
    echo "=================================="
    echo -e "${NC}"
    
    echo -e "${GREEN}1.${NC} Iniciar sistema completo (build + up)"
    echo -e "${GREEN}2.${NC} Iniciar sistema (sin rebuild)"
    echo -e "${YELLOW}3.${NC} Detener sistema"
    echo -e "${RED}4.${NC} Detener y limpiar (borra datos)"
    echo -e "${CYAN}5.${NC} Ver logs (todos)"
    echo -e "${CYAN}6.${NC} Ver logs del backend"
    echo -e "${CYAN}7.${NC} Ver logs del frontend"
    echo -e "${CYAN}8.${NC} Ver estado de contenedores"
    echo -e "${YELLOW}9.${NC} Reiniciar backend"
    echo -e "${YELLOW}10.${NC} Reiniciar frontend"
    echo -e "${CYAN}11.${NC} Acceder a PostgreSQL CLI"
    echo -e "${GREEN}12.${NC} Backup de base de datos"
    echo -e "${RED}0.${NC} Salir"
    echo ""
}

start_system() {
    echo -e "\n${GREEN}🚀 Iniciando sistema completo...${NC}"
    docker-compose up --build -d
    sleep 5
    show_status
}

start_system_no_build() {
    echo -e "\n${GREEN}🚀 Iniciando sistema...${NC}"
    docker-compose up -d
    sleep 3
    show_status
}

stop_system() {
    echo -e "\n${YELLOW}⏹️  Deteniendo sistema...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Sistema detenido${NC}"
}

stop_system_clean() {
    echo -e "\n${RED}⚠️  ¿Estás seguro? Esto borrará TODOS los datos de la base de datos.${NC}"
    read -p "Escribe 'SI' para confirmar: " confirm
    if [ "$confirm" == "SI" ]; then
        echo -e "\n${RED}🗑️  Limpiando sistema...${NC}"
        docker-compose down -v
        echo -e "${GREEN}✅ Sistema limpiado completamente${NC}"
    else
        echo -e "${YELLOW}❌ Operación cancelada${NC}"
    fi
}

show_logs() {
    echo -e "\n${CYAN}📋 Logs del sistema (Ctrl+C para salir)...${NC}"
    docker-compose logs -f
}

show_backend_logs() {
    echo -e "\n${CYAN}📋 Logs del backend (Ctrl+C para salir)...${NC}"
    docker-compose logs -f backend
}

show_frontend_logs() {
    echo -e "\n${CYAN}📋 Logs del frontend (Ctrl+C para salir)...${NC}"
    docker-compose logs -f frontend
}

show_status() {
    echo -e "\n${CYAN}📊 Estado de contenedores:${NC}"
    docker-compose ps
    echo ""
    
    # Verificar puertos
    if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL: http://localhost:5432${NC}"
    else
        echo -e "${RED}❌ PostgreSQL: NO RESPONDE${NC}"
    fi
    
    if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: http://localhost:3002${NC}"
    else
        echo -e "${RED}❌ Backend: NO RESPONDE${NC}"
    fi
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: http://localhost:3000${NC}"
    else
        echo -e "${RED}❌ Frontend: NO RESPONDE${NC}"
    fi
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && \
       lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1 && \
       lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "\n${GREEN}🎉 Sistema completamente operativo!${NC}"
        echo -e "${CYAN}   Accede en: http://localhost:3000${NC}\n"
    fi
}

restart_backend() {
    echo -e "\n${YELLOW}🔄 Reiniciando backend...${NC}"
    docker-compose restart backend
    echo -e "${GREEN}✅ Backend reiniciado${NC}"
}

restart_frontend() {
    echo -e "\n${YELLOW}🔄 Reiniciando frontend...${NC}"
    docker-compose restart frontend
    echo -e "${GREEN}✅ Frontend reiniciado${NC}"
}

access_postgresql() {
    echo -e "\n${CYAN}🐘 Accediendo a PostgreSQL CLI...${NC}"
    echo -e "${YELLOW}   (Escribe '\q' para salir)${NC}\n"
    docker exec -it taller_postgres psql -U postgres -d taller_db
}

backup_database() {
    timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    backup_file="backup_$timestamp.sql"
    
    echo -e "\n${GREEN}💾 Creando backup de base de datos...${NC}"
    docker exec taller_postgres pg_dump -U postgres taller_db > "$backup_file"
    
    if [ -f "$backup_file" ]; then
        echo -e "${GREEN}✅ Backup creado: $backup_file${NC}"
    else
        echo -e "${RED}❌ Error al crear backup${NC}"
    fi
}

# Menú principal
while true; do
    show_menu
    read -p "Selecciona una opción: " option
    
    case $option in
        1) start_system ;;
        2) start_system_no_build ;;
        3) stop_system ;;
        4) stop_system_clean ;;
        5) show_logs ;;
        6) show_backend_logs ;;
        7) show_frontend_logs ;;
        8) show_status ;;
        9) restart_backend ;;
        10) restart_frontend ;;
        11) access_postgresql ;;
        12) backup_database ;;
        0) echo -e "\n${GREEN}👋 ¡Hasta luego!${NC}\n"; exit 0 ;;
        *) echo -e "\n${RED}❌ Opción inválida${NC}\n" ;;
    esac
    
    if [[ ! "$option" =~ ^(0|5|6|7|11)$ ]]; then
        read -p $'\nPresiona Enter para continuar...'
    fi
done
