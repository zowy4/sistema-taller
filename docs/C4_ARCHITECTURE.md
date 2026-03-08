# Arquitectura C4 - Sistema Integral de Gestión de Taller

Este documento describe la arquitectura del sistema usando el modelo C4 hasta el nivel 3 (Componentes), en formato Mermaid compatible con GitHub.

## Nivel 1: Contexto del Sistema

```mermaid
C4Context
    title Nivel 1: Diagrama de Contexto - Sistema de Gestión de Taller

    Person(admin, "Administrador", "Dueño/Gerente. Gestiona finanzas, personal e inventario total.")
    Person(recep, "Recepcionista", "Atiende al cliente, crea órdenes (POS) y factura.")
    Person(tecnico, "Técnico", "Mecánico. Actualiza el estado de las reparaciones.")
    Person(cliente, "Cliente Final", "Dueño del vehículo. Consulta el estado de su reparación.")

    System(tallerSystem, "Sistema de Gestión de Taller", "Plataforma SaaS integral para administrar el ciclo operativo, financiero y de atención al cliente del taller automotriz.")

    System_Ext(oauthProvider, "Proveedores OAuth 2.0", "Google / GitHub. Proveen autenticación externa (SSO).")
    System_Ext(mailSystem, "Sistema de Correos", "Envío de notificaciones y recibos a clientes (Opcional/Futuro).")

    Rel(admin, tallerSystem, "Administra el negocio y visualiza KPIs", "HTTPS")
    Rel(recep, tallerSystem, "Gestiona clientes y crea órdenes", "HTTPS")
    Rel(tecnico, tallerSystem, "Actualiza estados de tareas", "HTTPS")
    Rel(cliente, tallerSystem, "Consulta el estatus de su auto", "HTTPS")

    Rel(tallerSystem, oauthProvider, "Autentica usuarios", "HTTPS/OAuth2")
    Rel(tallerSystem, mailSystem, "Envía correos transaccionales", "SMTP")

    UpdateElementStyle(tallerSystem, $fontColor="white", $bgColor="#E65100", $borderColor="#E65100")
```

## Nivel 2: Contenedores

```mermaid
C4Container
    title Nivel 2: Diagrama de Contenedores - Arquitectura Técnica

    Person(usuarios, "Usuarios del Sistema", "Admin, Técnico, Recepcionista, Cliente")

    System_Boundary(c1, "Sistema de Gestión de Taller") {
        Container(webApp, "Aplicación Web (SPA)", "Next.js, React, Tailwind", "Provee las interfaces 'Industrial Dark Mode' y 'Portal Cliente'. Maneja el estado con Tanstack Query.")
        Container(apiApp, "API Application", "NestJS, Node.js", "Provee la lógica de negocio, autenticación, autorización (RBAC/ABAC) y expone endpoints REST JSON.")
        ContainerDb(database, "Base de Datos", "PostgreSQL", "Almacena datos de clientes, órdenes, inventario, finanzas y usuarios de forma relacional y transaccional.")
    }

    System_Ext(oauthProvider, "Proveedores OAuth 2.0", "Google, GitHub")

    Rel(usuarios, webApp, "Interactúa con las interfaces", "HTTPS")
    Rel(webApp, apiApp, "Realiza llamadas a la API", "JSON/HTTPS")
    Rel(apiApp, database, "Lee y escribe información", "Prisma ORM / TCP")
    Rel(apiApp, oauthProvider, "Valida tokens y obtiene perfiles", "HTTPS")

    UpdateElementStyle(webApp, $fontColor="black", $bgColor="#61DAFB", $borderColor="#61DAFB")
    UpdateElementStyle(apiApp, $fontColor="white", $bgColor="#E0234E", $borderColor="#E0234E")
    UpdateElementStyle(database, $fontColor="white", $bgColor="#336791", $borderColor="#336791")
```

## Nivel 3: Componentes (Zoom en API Backend NestJS)

```mermaid
C4Component
    title Nivel 3: Diagrama de Componentes - API Application (Backend NestJS)

    Container(webApp, "Aplicación Web (SPA)", "Next.js", "Consume la API")
    ContainerDb(database, "Base de Datos", "PostgreSQL", "Almacena los datos")
    System_Ext(oauthProvider, "Proveedores OAuth 2.0", "Google, GitHub")

    Container_Boundary(apiApp, "API Application (NestJS)") {

        Component(globalFilters, "Global Security & Filters", "Helmet, ValidationPipe, AllExceptionsFilter", "Sanitiza entradas, previene XSS y formatea errores globales para no exponer datos.")

        Component(authModule, "Auth Module", "AuthGuard, RolesGuard, JwtStrategy", "Maneja tokens JWT, sesiones en cookies, y evalúa permisos RBAC.")

        Component(authCtrl, "Auth Controller", "Nest Controller", "Endpoints de Login y callbacks de OAuth2.")
        Component(ordenesCtrl, "Órdenes Controller", "Nest Controller", "Endpoints para crear (POS) y gestionar órdenes de trabajo.")
        Component(inventarioCtrl, "Inventario Controller", "Nest Controller", "Endpoints para gestionar stock y proveedores.")

        Component(authSvc, "Auth Service", "Nest Service", "Lógica de validación de usuarios y generación de JWT.")
        Component(ordenesSvc, "Órdenes Service", "Nest Service", "Contiene lógica ABAC (Ownership check), workflow de estados y transacciones ACID.")
        Component(inventarioSvc, "Inventario Service", "Nest Service", "Calcula alertas de stock crítico y deduce inventario.")

        Component(prismaSvc, "Prisma Service", "ORM Component", "Capa de abstracción para el acceso a PostgreSQL.")
    }

    Rel(webApp, globalFilters, "Peticiones HTTP/REST", "JSON")
    Rel(globalFilters, authModule, "Intercepta peticiones protegidas")

    Rel(authModule, authCtrl, "Enruta a")
    Rel(authModule, ordenesCtrl, "Valida roles (RBAC) y enruta a")
    Rel(authModule, inventarioCtrl, "Valida roles (RBAC) y enruta a")

    Rel(authCtrl, authSvc, "Usa")
    Rel(authCtrl, oauthProvider, "Redirige a")
    Rel(ordenesCtrl, ordenesSvc, "Usa")
    Rel(inventarioCtrl, inventarioSvc, "Usa")

    Rel(authSvc, prismaSvc, "Usa")
    Rel(ordenesSvc, prismaSvc, "Evalúa ABAC y ejecuta transacciones vía")
    Rel(inventarioSvc, prismaSvc, "Usa")

    Rel(prismaSvc, database, "SQL queries", "TCP/IP")
```

## Uso en la entrega

- En GitHub, este archivo renderiza los diagramas Mermaid automáticamente.
- Para Word/PDF, copia cada bloque en Mermaid Live Editor y exporta como PNG o SVG.
