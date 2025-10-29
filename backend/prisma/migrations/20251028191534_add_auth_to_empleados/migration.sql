/*
  Warnings:

  - You are about to drop the `Clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Empleados` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Facturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Historial_Vehiculo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrdenesDeTrabajo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ordenes_Repuestos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ordenes_Servicios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Repuestos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Servicios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehiculos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Facturas" DROP CONSTRAINT "Facturas_id_orden_fkey";

-- DropForeignKey
ALTER TABLE "Historial_Vehiculo" DROP CONSTRAINT "Historial_Vehiculo_id_orden_fkey";

-- DropForeignKey
ALTER TABLE "Historial_Vehiculo" DROP CONSTRAINT "Historial_Vehiculo_id_vehiculo_fkey";

-- DropForeignKey
ALTER TABLE "OrdenesDeTrabajo" DROP CONSTRAINT "OrdenesDeTrabajo_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "OrdenesDeTrabajo" DROP CONSTRAINT "OrdenesDeTrabajo_id_empleado_responsable_fkey";

-- DropForeignKey
ALTER TABLE "OrdenesDeTrabajo" DROP CONSTRAINT "OrdenesDeTrabajo_id_vehiculo_fkey";

-- DropForeignKey
ALTER TABLE "Ordenes_Repuestos" DROP CONSTRAINT "Ordenes_Repuestos_id_orden_fkey";

-- DropForeignKey
ALTER TABLE "Ordenes_Repuestos" DROP CONSTRAINT "Ordenes_Repuestos_id_repuesto_fkey";

-- DropForeignKey
ALTER TABLE "Ordenes_Servicios" DROP CONSTRAINT "Ordenes_Servicios_id_orden_fkey";

-- DropForeignKey
ALTER TABLE "Ordenes_Servicios" DROP CONSTRAINT "Ordenes_Servicios_id_servicio_fkey";

-- DropForeignKey
ALTER TABLE "Vehiculos" DROP CONSTRAINT "Vehiculos_id_cliente_fkey";

-- DropTable
DROP TABLE "Clientes";

-- DropTable
DROP TABLE "Empleados";

-- DropTable
DROP TABLE "Facturas";

-- DropTable
DROP TABLE "Historial_Vehiculo";

-- DropTable
DROP TABLE "OrdenesDeTrabajo";

-- DropTable
DROP TABLE "Ordenes_Repuestos";

-- DropTable
DROP TABLE "Ordenes_Servicios";

-- DropTable
DROP TABLE "Repuestos";

-- DropTable
DROP TABLE "Servicios";

-- DropTable
DROP TABLE "Vehiculos";

-- CreateTable
CREATE TABLE "clientes" (
    "id_cliente" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "empresa" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "direccion" TEXT,
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id_vehiculo" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "placa" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "detalles" TEXT,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id_vehiculo")
);

-- CreateTable
CREATE TABLE "empleados" (
    "id_empleado" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id_empleado")
);

-- CreateTable
CREATE TABLE "repuestos" (
    "id_repuesto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" TEXT NOT NULL,
    "cantidad_existente" DOUBLE PRECISION NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "nivel_minimo_alerta" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "repuestos_pkey" PRIMARY KEY ("id_repuesto")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id_servicio" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio_estandar" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "ordenes_de_trabajo" (
    "id_orden" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_vehiculo" INTEGER NOT NULL,
    "fecha_apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_estimada" TIMESTAMP(3),
    "fecha_entrega_real" TIMESTAMP(3),
    "estado" TEXT NOT NULL,
    "total_estimado" DOUBLE PRECISION,
    "total_real" DOUBLE PRECISION,
    "id_empleado_responsable" INTEGER NOT NULL,

    CONSTRAINT "ordenes_de_trabajo_pkey" PRIMARY KEY ("id_orden")
);

-- CreateTable
CREATE TABLE "ordenes_servicios" (
    "id" SERIAL NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ordenes_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_repuestos" (
    "id" SERIAL NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_repuesto" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ordenes_repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id_factura" SERIAL NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "fecha_factura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DOUBLE PRECISION NOT NULL,
    "estado_pago" TEXT NOT NULL,
    "metodo_pago" TEXT,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "historial_vehiculo" (
    "id_hist" SERIAL NOT NULL,
    "id_vehiculo" INTEGER NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kilometraje" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "historial_vehiculo_pkey" PRIMARY KEY ("id_hist")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_placa_key" ON "vehiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_vin_key" ON "vehiculos"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_email_key" ON "empleados"("email");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_id_orden_key" ON "facturas"("id_orden");

-- CreateIndex
CREATE UNIQUE INDEX "historial_vehiculo_id_orden_key" ON "historial_vehiculo"("id_orden");

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_de_trabajo" ADD CONSTRAINT "ordenes_de_trabajo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_de_trabajo" ADD CONSTRAINT "ordenes_de_trabajo_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "vehiculos"("id_vehiculo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_de_trabajo" ADD CONSTRAINT "ordenes_de_trabajo_id_empleado_responsable_fkey" FOREIGN KEY ("id_empleado_responsable") REFERENCES "empleados"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_servicios" ADD CONSTRAINT "ordenes_servicios_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes_de_trabajo"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_servicios" ADD CONSTRAINT "ordenes_servicios_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_repuestos" ADD CONSTRAINT "ordenes_repuestos_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes_de_trabajo"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_repuestos" ADD CONSTRAINT "ordenes_repuestos_id_repuesto_fkey" FOREIGN KEY ("id_repuesto") REFERENCES "repuestos"("id_repuesto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes_de_trabajo"("id_orden") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_vehiculo" ADD CONSTRAINT "historial_vehiculo_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "vehiculos"("id_vehiculo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_vehiculo" ADD CONSTRAINT "historial_vehiculo_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes_de_trabajo"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;
