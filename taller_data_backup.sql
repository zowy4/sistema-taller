--
-- PostgreSQL database dump
--

\restrict vnmbEefVW3zqaw61Tr7us0wpK3ujPtaPdMaJj0JBwhsiz9Dsj5hQd5duECxJ3oc

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Clientes" VALUES (4, 'Luis', 'Mendez', 'Publico', '4432178690', 'Luismendez@gmail.com', NULL, 'calle falsa 4', '2025-11-04 02:36:02.307');
INSERT INTO public."Clientes" VALUES (2, 'QA', 'Flow', 'Publico', '443646346346', 'qa.flow.1762127429844@example.com', NULL, 'Test', '2025-11-02 23:50:30.506');
INSERT INTO public."Clientes" VALUES (5, 'Andres', 'Mendez', 'Publico', '443278887', 'andresmendez@gmail.com', NULL, 'calle falsa 5', '2025-11-04 03:00:52.588');
INSERT INTO public."Clientes" VALUES (3, 'QA', 'Flow', '', '000', 'luis1762127442387@example.com', NULL, 'Test', '2025-11-02 23:50:43.187');
INSERT INTO public."Clientes" VALUES (6, 'LUIS', 'Piñon', 'Publico', '4433152444', 'luispinon@gmail.com', NULL, 'calle falsa 6', '2025-11-04 03:14:07.774');
INSERT INTO public."Clientes" VALUES (7, 'Rodrigo', 'zavala', 'publico', '443212345', 'rodrigozavala@gmail.com', '$2b$10$isg3VEmTClpMmp8H9e5SruGEn.Adp2671gfDzlrzBWiE/MUnYoSVK', 'calle falsa 7', '2025-11-22 03:14:26.688');
INSERT INTO public."Clientes" VALUES (8, 'Rodrigo', 'zavala', 'publico', '4455676', 'rodrigozavala1@gmail.com', '$2b$10$Fnzqh1/akS5q7L3eGhp4tu8ntx3OStX/3Hgl7RyFMCHdS5PLF9arO', 'calle falsa 7', '2025-11-22 04:06:59.446');
INSERT INTO public."Clientes" VALUES (1, 'Cliente', 'Mendezejmplo', 'Empresa Ejemplo', '123456789', 'cliente@ejemplo.com', '$2b$10$EL1IMX/T0W3SkIeLk3O36e6j0HquUbNMG7dDFtbkIKiywh5oFHtT.', 'Calle Ejemplo 123', '2025-11-02 06:21:37.913');
INSERT INTO public."Clientes" VALUES (9, 'jose', 'mendez', '', '4467877', 'jose@gmail.com', NULL, 'calle 1', '2025-12-12 05:48:16.479');


--
-- Data for Name: Proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Proveedores" VALUES (1, 'Mario', 'Ford', '445636363', 'Mario@gmail.com', 'provedor de piezas ford', true, '2025-11-18 00:22:56.17');


--
-- Data for Name: Compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Compras" VALUES (1, '2025-11-18 00:23:58.632', 854, 'pendiente', 'prueba', 1);
INSERT INTO public."Compras" VALUES (2, '2025-11-30 19:44:50.673', 1600, 'pendiente', NULL, 1);


--
-- Data for Name: Repuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Repuestos" VALUES (4, 'Filtro de aceite', 'Filtro de aceite universal para motores de gasolina', 'unidad', 49, 15.99, 10, 'REP-00004', 11.193);
INSERT INTO public."Repuestos" VALUES (5, 'Neumático 195/65 R15', 'Neumático radial 195/65 R15', 'unidad', 9, 85, 8, 'REP-00005', 59.49999999999999);
INSERT INTO public."Repuestos" VALUES (1, 'Líquido refrigerante', 'Líquido refrigerante anticongelante, 1 litro', 'litro', 44, 9.99, 10, 'REP-00001', 6.992999999999999);
INSERT INTO public."Repuestos" VALUES (9, 'Filtro-1762127429844', 'Repuesto QA', 'unidad', 98, 10, 5, 'REP-00009', 7);
INSERT INTO public."Repuestos" VALUES (10, 'Filtro-1762127442387', 'Repuesto QA', 'unidad', 98, 10, 5, 'REP-00010', 7);
INSERT INTO public."Repuestos" VALUES (6, 'Pastillas de freno delanteras', 'Juego de pastillas de freno para disco delantero', 'juego', 24, 45.5, 5, 'REP-00006', 31.849999999999998);
INSERT INTO public."Repuestos" VALUES (3, 'Batería 12V 65Ah', 'Batería de 12V y 65Ah para vehículos', 'unidad', 9, 125, 3, 'REP-00003', 87.5);
INSERT INTO public."Repuestos" VALUES (8, 'Bujías NGK', 'Bujías de platino NGK', 'unidad', 79, 8.5, 15, 'REP-00008', 5.949999999999999);
INSERT INTO public."Repuestos" VALUES (2, 'Correa de distribución', 'Correa de distribución reforzada', 'unidad', 21, 35, 5, 'REP-00002', 24.5);
INSERT INTO public."Repuestos" VALUES (7, 'Aceite de motor 5W-30', 'Aceite sintético para motor 5W-30, 1 litro', 'litro', 5, 12.75, 20, 'REP-00007', 8.924999999999999);


--
-- Data for Name: Compras_Repuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Compras_Repuestos" VALUES (1, 7, 122, 854, 1, 2);
INSERT INTO public."Compras_Repuestos" VALUES (2, 4, 400, 1600, 2, 3);


--
-- Data for Name: Empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Empleados" VALUES (3, 'María', 'Recepción', 'recepcion@taller.com', '$2b$10$EL1IMX/T0W3SkIeLk3O36e6j0HquUbNMG7dDFtbkIKiywh5oFHtT.', 'recepcion', '2025-11-02 06:21:37.906', true, NULL, NULL);
INSERT INTO public."Empleados" VALUES (1, 'Carlos', 'Técnico', 'tecnico@taller.com', '$2b$10$EL1IMX/T0W3SkIeLk3O36e6j0HquUbNMG7dDFtbkIKiywh5oFHtT.', 'tecnico', '2025-11-02 06:21:37.906', true, NULL, NULL);
INSERT INTO public."Empleados" VALUES (4, 'Juan', 'Supervisor', 'supervisor@taller.com', '$2b$10$EL1IMX/T0W3SkIeLk3O36e6j0HquUbNMG7dDFtbkIKiywh5oFHtT.', 'supervisor', '2025-11-02 06:21:37.906', true, NULL, NULL);
INSERT INTO public."Empleados" VALUES (5, 'Juan', 'P�rez', 'juan.perez+test@correo.com', '$2b$10$ZjmCFPpzLsCyLPGp9ga4OuArsZr1i0vozDkWQ5P6DDLIY18x8IWyy', 'tecnico', '2025-11-02 23:16:25.188', true, NULL, NULL);
INSERT INTO public."Empleados" VALUES (6, 'Andrés', 'Zavala', 'tecnico2@taller.com', '$2b$10$Tyv30GKtXLKfofAjfp2CSOP4sWnDjjt004mLJ7rw/s/mt6dDC3l6O', 'tecnico', '2025-11-02 23:17:05.385', true, NULL, NULL);
INSERT INTO public."Empleados" VALUES (10, 'Maria', 'Piñon', 'admin3@taller.com', '$2b$10$ZVMIMiRraahfXZ4lC6XyPuleTCWLzQl1mhfU36LaQ2uGVGOA7I8xm', 'admin', '2025-11-04 03:06:48.458', true, 'cllle falsa', '4432332345');
INSERT INTO public."Empleados" VALUES (7, 'Zoé', 'Chacón', 'recepcion2@taller.com', '$2b$10$b6AnQp1p9TPQ9u0d4lhAoumpgodTqa620gh0mbInKD/KaEhRdyeU2', 'recepcionista', '2025-11-02 23:30:26.802', true, 'alguna', '5345636356356');
INSERT INTO public."Empleados" VALUES (11, 'david', 'Garcia', 'recepcion6@taller.com', '$2b$10$bnDCLvNjpDP7nsZe1NyYhOD/ecFhtMZO74k9FoquZKF27YWfZObru', 'recepcionista', '2025-11-04 03:20:08.454', true, 'calle falsa 18', '441223232');
INSERT INTO public."Empleados" VALUES (13, 'Test', 'Admin', 'test@taller.com', '$2b$10$UsHq41TXydgIBVgGN6hE5esI8gUtg5sJ8PGZ1Hsx85/9K8UhsTcIG', 'tecnico', '2025-11-18 19:29:47.474', true, '', '44556677');
INSERT INTO public."Empleados" VALUES (2, 'Admin', 'Sistema', 'admin@taller.com', '$2b$10$EL1IMX/T0W3SkIeLk3O36e6j0HquUbNMG7dDFtbkIKiywh5oFHtT.', 'admin', '2025-11-02 06:21:37.906', true, NULL, NULL);
INSERT INTO public."Empleados" VALUES (8, 'Tech', 'Tester', NULL, NULL, 'tecnico', '2025-11-02 23:50:30.529', true, NULL, NULL);
INSERT INTO public."Empleados" VALUES (9, 'Tech', 'Tester', NULL, NULL, 'tecnico', '2025-11-02 23:50:43.209', true, NULL, NULL);


--
-- Data for Name: Permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Permisos" VALUES (1, 'clientes:create', 'Crear nuevos clientes', 'clientes', 'create');
INSERT INTO public."Permisos" VALUES (2, 'clientes:update', 'Actualizar información de clientes', 'clientes', 'update');
INSERT INTO public."Permisos" VALUES (5, 'facturas:delete', 'Eliminar facturas', 'facturas', 'delete');
INSERT INTO public."Permisos" VALUES (4, 'clientes:delete', 'Eliminar clientes', 'clientes', 'delete');
INSERT INTO public."Permisos" VALUES (3, 'vehiculos:read', 'Ver información de vehículos', 'vehiculos', 'read');
INSERT INTO public."Permisos" VALUES (6, 'empleados:create', 'Crear nuevos empleados', 'empleados', 'create');
INSERT INTO public."Permisos" VALUES (7, 'empleados:read', 'Ver información de empleados', 'empleados', 'read');
INSERT INTO public."Permisos" VALUES (8, 'empleados:update', 'Actualizar información de empleados', 'empleados', 'update');
INSERT INTO public."Permisos" VALUES (9, 'ordenes:create', 'Crear nuevas órdenes de trabajo', 'ordenes', 'create');
INSERT INTO public."Permisos" VALUES (10, 'repuestos:read', 'Ver información de repuestos', 'repuestos', 'read');
INSERT INTO public."Permisos" VALUES (11, 'repuestos:create', 'Crear nuevos repuestos', 'repuestos', 'create');
INSERT INTO public."Permisos" VALUES (12, 'repuestos:update', 'Actualizar información de repuestos', 'repuestos', 'update');
INSERT INTO public."Permisos" VALUES (13, 'repuestos:delete', 'Eliminar repuestos', 'repuestos', 'delete');
INSERT INTO public."Permisos" VALUES (14, 'empleados:delete', 'Eliminar empleados', 'empleados', 'delete');
INSERT INTO public."Permisos" VALUES (15, 'configuracion:update', 'Modificar configuración del sistema', 'configuracion', 'update');
INSERT INTO public."Permisos" VALUES (16, 'reportes:read', 'Ver reportes y estadísticas', 'reportes', 'read');
INSERT INTO public."Permisos" VALUES (17, 'ordenes:update', 'Actualizar órdenes de trabajo', 'ordenes', 'update');
INSERT INTO public."Permisos" VALUES (18, 'clientes:read', 'Ver información de clientes', 'clientes', 'read');
INSERT INTO public."Permisos" VALUES (19, 'facturas:create', 'Crear facturas', 'facturas', 'create');
INSERT INTO public."Permisos" VALUES (20, 'facturas:update', 'Actualizar facturas', 'facturas', 'update');
INSERT INTO public."Permisos" VALUES (21, 'ordenes:delete', 'Eliminar órdenes de trabajo', 'ordenes', 'delete');
INSERT INTO public."Permisos" VALUES (22, 'vehiculos:update', 'Actualizar información de vehículos', 'vehiculos', 'update');
INSERT INTO public."Permisos" VALUES (23, 'facturas:read', 'Ver facturas', 'facturas', 'read');
INSERT INTO public."Permisos" VALUES (24, 'vehiculos:delete', 'Eliminar vehículos', 'vehiculos', 'delete');
INSERT INTO public."Permisos" VALUES (25, 'vehiculos:create', 'Crear nuevos vehículos', 'vehiculos', 'create');
INSERT INTO public."Permisos" VALUES (26, 'ordenes:read', 'Ver órdenes de trabajo', 'ordenes', 'read');


--
-- Data for Name: Empleado_Permiso; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Vehiculos" VALUES (2, 'QA429844', 'VIN1762127429844', 'TestMarca', 'TestModelo', 2020, 'QA', 2);
INSERT INTO public."Vehiculos" VALUES (3, 'QA442387', 'VIN1762127442387', 'TestMarca', 'TestModelo', 2020, 'QA', 3);
INSERT INTO public."Vehiculos" VALUES (4, '3rr324325', '425435', 'jeep', 'rangel', 2025, NULL, 4);
INSERT INTO public."Vehiculos" VALUES (1, '2134324', '5363', 'jep', 'patriot', 2025, NULL, 5);
INSERT INTO public."Vehiculos" VALUES (5, '432d23f', '3424', 'jeep', 'patriot', 2010, 'choco', 4);
INSERT INTO public."Vehiculos" VALUES (6, '4534535', '3243', 'mercedez', 'v8', 2018, 'chocado', 6);
INSERT INTO public."Vehiculos" VALUES (7, '6737474', '4254', 'porche', 'cayena', 2000, 'chochado', 7);
INSERT INTO public."Vehiculos" VALUES (8, '66989', '654', 'porche', 'cayena', 2025, 'pintura', 8);
INSERT INTO public."Vehiculos" VALUES (9, 'cazz2347', 'trgt', 'laborgini', 'aventador', 2025, 'pintura', 1);


--
-- Data for Name: OrdenesDeTrabajo; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."OrdenesDeTrabajo" VALUES (7, '2025-11-02 23:50:30.62', '2025-11-03 23:50:30.563', '2025-11-02 23:50:30.756', 'entregado', 120, 120, 2, 2, 8, NULL);
INSERT INTO public."OrdenesDeTrabajo" VALUES (8, '2025-11-02 23:50:43.302', '2025-11-03 23:50:43.246', '2025-11-02 23:50:43.382', 'entregado', 120, 120, 3, 3, 9, NULL);
INSERT INTO public."OrdenesDeTrabajo" VALUES (6, '2025-11-02 19:49:13.675', '2025-11-03 00:00:00', '2025-11-02 23:57:44.77', 'entregado', 207.23, 207.23, 1, 1, 2, NULL);
INSERT INTO public."OrdenesDeTrabajo" VALUES (9, '2025-11-04 03:04:17.681', '2025-11-04 00:00:00', NULL, 'en proceso', 425, NULL, 5, 1, 2, NULL);
INSERT INTO public."OrdenesDeTrabajo" VALUES (11, '2025-11-22 04:02:55.74', NULL, NULL, 'en_proceso', 1012.75, NULL, 7, 7, NULL, 'Fecha entrega: ');
INSERT INTO public."OrdenesDeTrabajo" VALUES (12, '2025-11-22 04:08:23.806', NULL, NULL, 'en_proceso', 400, NULL, 8, 8, NULL, 'Fecha entrega: 2025-11-22');
INSERT INTO public."OrdenesDeTrabajo" VALUES (14, '2025-12-12 05:47:23.091', NULL, NULL, 'pendiente', 6562.77, NULL, 1, 9, NULL, 'Fecha entrega: 2025-12-26');
INSERT INTO public."OrdenesDeTrabajo" VALUES (10, '2025-11-04 03:17:30.675', '2025-11-05 00:00:00', '2025-12-12 06:14:39.68', 'completado', 1012.75, 1012.75, 6, 6, 2, NULL);
INSERT INTO public."OrdenesDeTrabajo" VALUES (13, '2025-11-30 19:41:20.733', NULL, NULL, 'en_proceso', 445.5, NULL, 4, 4, NULL, 'Fecha entrega: 2025-12-04');
INSERT INTO public."OrdenesDeTrabajo" VALUES (15, '2025-12-12 05:51:25.639', NULL, NULL, 'en_proceso', 7325.02, NULL, 5, 1, NULL, 'Fecha entrega: 2025-12-27');


--
-- Data for Name: Facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Facturas" VALUES (1, '2025-11-02 23:50:30.782', 120, 'pagada', 'efectivo', 7);
INSERT INTO public."Facturas" VALUES (2, '2025-11-02 23:50:43.402', 120, 'pagada', 'efectivo', 8);
INSERT INTO public."Facturas" VALUES (3, '2025-11-02 23:57:54.56', 207.23, 'pagada', 'efectivo', 6);


--
-- Data for Name: Historial_Vehiculo; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Ordenes_Repuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Ordenes_Repuestos" VALUES (1, 1, 12.75, 12.75, 6, 7);
INSERT INTO public."Ordenes_Repuestos" VALUES (2, 1, 125, 125, 6, 3);
INSERT INTO public."Ordenes_Repuestos" VALUES (3, 1, 8.5, 8.5, 6, 8);
INSERT INTO public."Ordenes_Repuestos" VALUES (4, 1, 35, 35, 6, 2);
INSERT INTO public."Ordenes_Repuestos" VALUES (5, 1, 15.99, 15.99, 6, 4);
INSERT INTO public."Ordenes_Repuestos" VALUES (6, 1, 9.99, 9.99, 6, 1);
INSERT INTO public."Ordenes_Repuestos" VALUES (7, 2, 10, 20, 7, 9);
INSERT INTO public."Ordenes_Repuestos" VALUES (8, 2, 10, 20, 8, 10);
INSERT INTO public."Ordenes_Repuestos" VALUES (9, 1, 125, 125, 9, 3);
INSERT INTO public."Ordenes_Repuestos" VALUES (10, 1, 12.75, 12.75, 10, 7);
INSERT INTO public."Ordenes_Repuestos" VALUES (11, 1, 12.75, 12.75, 11, 7);
INSERT INTO public."Ordenes_Repuestos" VALUES (12, 1, 45.5, 45.5, 13, 6);
INSERT INTO public."Ordenes_Repuestos" VALUES (13, 1, 12.75, 12.75, 14, 7);
INSERT INTO public."Ordenes_Repuestos" VALUES (14, 1, 125, 125, 15, 3);


--
-- Data for Name: Servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Servicios" VALUES (5, 'pulido de coche', 'se va a pulir y detallar el vehiculo', 1000, true, 60);
INSERT INTO public."Servicios" VALUES (1, 'ejemplo', 'sacado de golpes', 5000.02, true, 60);
INSERT INTO public."Servicios" VALUES (6, 'Motor', 'lavado de motor', 1200, true, 60);
INSERT INTO public."Servicios" VALUES (2, 'Revision-1762127429844', 'Servicio QA', 50, true, 60);
INSERT INTO public."Servicios" VALUES (3, 'Revision-1762127442387', 'Servicio QA', 12132, true, 60);
INSERT INTO public."Servicios" VALUES (4, 'pintura', 'pintar jeep', 500, true, 60);
INSERT INTO public."Servicios" VALUES (7, 'encerado', 'encerar', 1200, true, 60);
INSERT INTO public."Servicios" VALUES (10, 'lavado de interior', 'lavar interior', 1200, true, 60);


--
-- Data for Name: Ordenes_Servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Ordenes_Servicios" VALUES (1, 2, 50, 100, 7, 2);
INSERT INTO public."Ordenes_Servicios" VALUES (2, 2, 50, 100, 8, 3);
INSERT INTO public."Ordenes_Servicios" VALUES (3, 1, 300, 300, 9, 4);
INSERT INTO public."Ordenes_Servicios" VALUES (4, 1, 1000, 1000, 10, 5);
INSERT INTO public."Ordenes_Servicios" VALUES (5, 1, 1000, 1000, 11, 5);
INSERT INTO public."Ordenes_Servicios" VALUES (6, 1, 50, 50, 12, 2);
INSERT INTO public."Ordenes_Servicios" VALUES (7, 1, 50, 50, 12, 3);
INSERT INTO public."Ordenes_Servicios" VALUES (8, 1, 300, 300, 12, 4);
INSERT INTO public."Ordenes_Servicios" VALUES (9, 1, 50, 50, 13, 2);
INSERT INTO public."Ordenes_Servicios" VALUES (10, 1, 50, 50, 13, 3);
INSERT INTO public."Ordenes_Servicios" VALUES (11, 1, 300, 300, 13, 4);
INSERT INTO public."Ordenes_Servicios" VALUES (12, 1, 1000, 1000, 14, 5);
INSERT INTO public."Ordenes_Servicios" VALUES (13, 1, 5000.02, 5000.02, 14, 1);
INSERT INTO public."Ordenes_Servicios" VALUES (14, 1, 50, 50, 14, 2);
INSERT INTO public."Ordenes_Servicios" VALUES (15, 1, 500, 500, 14, 4);
INSERT INTO public."Ordenes_Servicios" VALUES (16, 1, 1000, 1000, 15, 5);
INSERT INTO public."Ordenes_Servicios" VALUES (17, 1, 5000.02, 5000.02, 15, 1);
INSERT INTO public."Ordenes_Servicios" VALUES (18, 1, 1200, 1200, 15, 6);


--
-- Data for Name: Roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Roles" VALUES (1, 'tecnico', 'Técnico con acceso limitado a órdenes de trabajo', true);
INSERT INTO public."Roles" VALUES (2, 'admin', 'Administrador del sistema con acceso completo', true);
INSERT INTO public."Roles" VALUES (3, 'recepcion', 'Recepción con acceso a clientes y órdenes', true);
INSERT INTO public."Roles" VALUES (4, 'supervisor', 'Supervisor con acceso a gestión y reportes', true);


--
-- Data for Name: Rol_Permiso; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Rol_Permiso" VALUES (2, 1);
INSERT INTO public."Rol_Permiso" VALUES (2, 18);
INSERT INTO public."Rol_Permiso" VALUES (2, 2);
INSERT INTO public."Rol_Permiso" VALUES (2, 4);
INSERT INTO public."Rol_Permiso" VALUES (2, 25);
INSERT INTO public."Rol_Permiso" VALUES (2, 3);
INSERT INTO public."Rol_Permiso" VALUES (2, 22);
INSERT INTO public."Rol_Permiso" VALUES (2, 24);
INSERT INTO public."Rol_Permiso" VALUES (2, 9);
INSERT INTO public."Rol_Permiso" VALUES (2, 26);
INSERT INTO public."Rol_Permiso" VALUES (2, 17);
INSERT INTO public."Rol_Permiso" VALUES (2, 21);
INSERT INTO public."Rol_Permiso" VALUES (2, 19);
INSERT INTO public."Rol_Permiso" VALUES (2, 23);
INSERT INTO public."Rol_Permiso" VALUES (2, 20);
INSERT INTO public."Rol_Permiso" VALUES (2, 5);
INSERT INTO public."Rol_Permiso" VALUES (2, 6);
INSERT INTO public."Rol_Permiso" VALUES (2, 7);
INSERT INTO public."Rol_Permiso" VALUES (2, 8);
INSERT INTO public."Rol_Permiso" VALUES (2, 14);
INSERT INTO public."Rol_Permiso" VALUES (2, 11);
INSERT INTO public."Rol_Permiso" VALUES (2, 10);
INSERT INTO public."Rol_Permiso" VALUES (2, 12);
INSERT INTO public."Rol_Permiso" VALUES (2, 13);
INSERT INTO public."Rol_Permiso" VALUES (2, 16);
INSERT INTO public."Rol_Permiso" VALUES (2, 15);
INSERT INTO public."Rol_Permiso" VALUES (4, 1);
INSERT INTO public."Rol_Permiso" VALUES (4, 18);
INSERT INTO public."Rol_Permiso" VALUES (4, 2);
INSERT INTO public."Rol_Permiso" VALUES (4, 4);
INSERT INTO public."Rol_Permiso" VALUES (4, 25);
INSERT INTO public."Rol_Permiso" VALUES (4, 3);
INSERT INTO public."Rol_Permiso" VALUES (4, 22);
INSERT INTO public."Rol_Permiso" VALUES (4, 24);
INSERT INTO public."Rol_Permiso" VALUES (4, 9);
INSERT INTO public."Rol_Permiso" VALUES (4, 26);
INSERT INTO public."Rol_Permiso" VALUES (4, 17);
INSERT INTO public."Rol_Permiso" VALUES (4, 21);
INSERT INTO public."Rol_Permiso" VALUES (4, 19);
INSERT INTO public."Rol_Permiso" VALUES (4, 23);
INSERT INTO public."Rol_Permiso" VALUES (4, 20);
INSERT INTO public."Rol_Permiso" VALUES (4, 5);
INSERT INTO public."Rol_Permiso" VALUES (4, 6);
INSERT INTO public."Rol_Permiso" VALUES (4, 7);
INSERT INTO public."Rol_Permiso" VALUES (4, 8);
INSERT INTO public."Rol_Permiso" VALUES (4, 11);
INSERT INTO public."Rol_Permiso" VALUES (4, 10);
INSERT INTO public."Rol_Permiso" VALUES (4, 12);
INSERT INTO public."Rol_Permiso" VALUES (4, 13);
INSERT INTO public."Rol_Permiso" VALUES (4, 16);
INSERT INTO public."Rol_Permiso" VALUES (1, 18);
INSERT INTO public."Rol_Permiso" VALUES (1, 3);
INSERT INTO public."Rol_Permiso" VALUES (1, 26);
INSERT INTO public."Rol_Permiso" VALUES (1, 17);
INSERT INTO public."Rol_Permiso" VALUES (1, 23);
INSERT INTO public."Rol_Permiso" VALUES (1, 10);
INSERT INTO public."Rol_Permiso" VALUES (1, 12);
INSERT INTO public."Rol_Permiso" VALUES (3, 1);
INSERT INTO public."Rol_Permiso" VALUES (3, 18);
INSERT INTO public."Rol_Permiso" VALUES (3, 2);
INSERT INTO public."Rol_Permiso" VALUES (3, 4);
INSERT INTO public."Rol_Permiso" VALUES (3, 25);
INSERT INTO public."Rol_Permiso" VALUES (3, 3);
INSERT INTO public."Rol_Permiso" VALUES (3, 22);
INSERT INTO public."Rol_Permiso" VALUES (3, 24);
INSERT INTO public."Rol_Permiso" VALUES (3, 9);
INSERT INTO public."Rol_Permiso" VALUES (3, 26);
INSERT INTO public."Rol_Permiso" VALUES (3, 17);
INSERT INTO public."Rol_Permiso" VALUES (3, 21);
INSERT INTO public."Rol_Permiso" VALUES (3, 19);
INSERT INTO public."Rol_Permiso" VALUES (3, 23);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('ab355f5e-9792-40e5-9e21-7463da01f9d0', '471c29bcff2f3825f4f8181aff4cbaa971d74f6205fbb71b045ba81a0de3ab8e', '2025-11-02 00:21:31.956781-06', '20251028044432_crear_base_de_datos_completa', NULL, NULL, '2025-11-02 00:21:31.866623-06', 1);
INSERT INTO public._prisma_migrations VALUES ('b5d17b5d-49de-4a35-b8c6-9eb924a6b49e', '01abe5c390bc3204ff697315551f34f6dfec8b56751ed112b434bac54e3658cf', '2025-11-02 00:21:32.096135-06', '20251028191534_add_auth_to_empleados', NULL, NULL, '2025-11-02 00:21:31.957828-06', 1);
INSERT INTO public._prisma_migrations VALUES ('50072f81-89bc-4807-9071-bffb8fc5ca8e', '610acb3ce3cbae268d1a7d9f21decf5d8bfeed44a8e5a428adb4801ce8c69e3d', '2025-11-02 00:21:32.254237-06', '20251029011639_add_auth_fields', NULL, NULL, '2025-11-02 00:21:32.097667-06', 1);
INSERT INTO public._prisma_migrations VALUES ('546bb02a-c0aa-4e83-908c-39aaa648709a', '50cfa129187046a26401dfc90ba5a58f3b9a9436e5cd0fb139dd2aee0ad533cc', '2025-11-02 00:21:32.295937-06', '20251029031004_add_roles_and_permissions', NULL, NULL, '2025-11-02 00:21:32.255409-06', 1);
INSERT INTO public._prisma_migrations VALUES ('d4a9243b-f6ba-4f6b-8bcc-a6160f48e073', '1dc7d326e41252436357149e078af4159f221f4f4619edcc534ee1b4e4a5b222', '2025-11-02 17:20:42.230517-06', '20251102232042_add_telefono_direccion_empleados', NULL, NULL, '2025-11-02 17:20:42.224708-06', 1);
INSERT INTO public._prisma_migrations VALUES ('b3f486e6-2129-4e6c-be10-d6613ccca356', '2e2686fc54702a0c641c5c350c82a867eed916cddd644fd927f30b2f9a45af49', '2025-11-15 14:19:45.736292-06', '20251115201945_agregar_modulo_compras', NULL, NULL, '2025-11-15 14:19:45.678436-06', 1);
INSERT INTO public._prisma_migrations VALUES ('ed56103f-2a7c-4a8d-a356-62a9151e3509', '122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec', '2025-11-15 14:23:38.432966-06', '20251115202328_agregar_modulo_compras', NULL, NULL, '2025-11-15 14:23:38.42928-06', 1);


--
-- Name: Clientes_id_cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Clientes_id_cliente_seq"', 9, true);


--
-- Name: Compras_Repuestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Compras_Repuestos_id_seq"', 2, true);


--
-- Name: Compras_id_compra_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Compras_id_compra_seq"', 2, true);


--
-- Name: Empleados_id_empleado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Empleados_id_empleado_seq"', 13, true);


--
-- Name: Facturas_id_factura_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Facturas_id_factura_seq"', 3, true);


--
-- Name: Historial_Vehiculo_id_hist_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Historial_Vehiculo_id_hist_seq"', 1, false);


--
-- Name: OrdenesDeTrabajo_id_orden_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrdenesDeTrabajo_id_orden_seq"', 15, true);


--
-- Name: Ordenes_Repuestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Ordenes_Repuestos_id_seq"', 14, true);


--
-- Name: Ordenes_Servicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Ordenes_Servicios_id_seq"', 18, true);


--
-- Name: Permisos_id_permiso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Permisos_id_permiso_seq"', 26, true);


--
-- Name: Proveedores_id_proveedor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Proveedores_id_proveedor_seq"', 1, true);


--
-- Name: Repuestos_id_repuesto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Repuestos_id_repuesto_seq"', 10, true);


--
-- Name: Roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Roles_id_rol_seq"', 16, true);


--
-- Name: Servicios_id_servicio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Servicios_id_servicio_seq"', 10, true);


--
-- Name: Vehiculos_id_vehiculo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Vehiculos_id_vehiculo_seq"', 9, true);


--
-- PostgreSQL database dump complete
--

\unrestrict vnmbEefVW3zqaw61Tr7us0wpK3ujPtaPdMaJj0JBwhsiz9Dsj5hQd5duECxJ3oc

