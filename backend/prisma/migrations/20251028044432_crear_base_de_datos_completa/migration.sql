-- CreateTable
CREATE TABLE "Clientes" (
    "id_cliente" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "empresa" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Vehiculos" (
    "id_vehiculo" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "detalles" TEXT,
    "id_cliente" INTEGER NOT NULL,

    CONSTRAINT "Vehiculos_pkey" PRIMARY KEY ("id_vehiculo")
);

-- CreateTable
CREATE TABLE "Empleados" (
    "id_empleado" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Empleados_pkey" PRIMARY KEY ("id_empleado")
);

-- CreateTable
CREATE TABLE "OrdenesDeTrabajo" (
    "id_orden" SERIAL NOT NULL,
    "fecha_apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_estimada" TIMESTAMP(3) NOT NULL,
    "fecha_entrega_real" TIMESTAMP(3),
    "estado" TEXT NOT NULL,
    "total_estimado" DOUBLE PRECISION NOT NULL,
    "total_real" DOUBLE PRECISION,
    "id_cliente" INTEGER NOT NULL,
    "id_vehiculo" INTEGER NOT NULL,
    "id_empleado_responsable" INTEGER NOT NULL,

    CONSTRAINT "OrdenesDeTrabajo_pkey" PRIMARY KEY ("id_orden")
);

-- CreateTable
CREATE TABLE "Repuestos" (
    "id_repuesto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" TEXT NOT NULL,
    "cantidad_existente" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "nivel_minimo_alerta" INTEGER NOT NULL,

    CONSTRAINT "Repuestos_pkey" PRIMARY KEY ("id_repuesto")
);

-- CreateTable
CREATE TABLE "Servicios" (
    "id_servicio" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio_estandar" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "Ordenes_Servicios" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_servicio" INTEGER NOT NULL,

    CONSTRAINT "Ordenes_Servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ordenes_Repuestos" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_repuesto" INTEGER NOT NULL,

    CONSTRAINT "Ordenes_Repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facturas" (
    "id_factura" SERIAL NOT NULL,
    "fecha_factura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DOUBLE PRECISION NOT NULL,
    "estado_pago" TEXT NOT NULL,
    "metodo_pago" TEXT,
    "id_orden" INTEGER NOT NULL,

    CONSTRAINT "Facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "Historial_Vehiculo" (
    "id_hist" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "kilometraje" INTEGER NOT NULL,
    "notas" TEXT,
    "id_vehiculo" INTEGER NOT NULL,
    "id_orden" INTEGER NOT NULL,

    CONSTRAINT "Historial_Vehiculo_pkey" PRIMARY KEY ("id_hist")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_email_key" ON "Clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculos_placa_key" ON "Vehiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculos_vin_key" ON "Vehiculos"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Repuestos_nombre_key" ON "Repuestos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Servicios_nombre_key" ON "Servicios"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Ordenes_Servicios_id_orden_id_servicio_key" ON "Ordenes_Servicios"("id_orden", "id_servicio");

-- CreateIndex
CREATE UNIQUE INDEX "Ordenes_Repuestos_id_orden_id_repuesto_key" ON "Ordenes_Repuestos"("id_orden", "id_repuesto");

-- CreateIndex
CREATE UNIQUE INDEX "Facturas_id_orden_key" ON "Facturas"("id_orden");

-- AddForeignKey
ALTER TABLE "Vehiculos" ADD CONSTRAINT "Vehiculos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenesDeTrabajo" ADD CONSTRAINT "OrdenesDeTrabajo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenesDeTrabajo" ADD CONSTRAINT "OrdenesDeTrabajo_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculos"("id_vehiculo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenesDeTrabajo" ADD CONSTRAINT "OrdenesDeTrabajo_id_empleado_responsable_fkey" FOREIGN KEY ("id_empleado_responsable") REFERENCES "Empleados"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ordenes_Servicios" ADD CONSTRAINT "Ordenes_Servicios_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "OrdenesDeTrabajo"("id_orden") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ordenes_Servicios" ADD CONSTRAINT "Ordenes_Servicios_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "Servicios"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ordenes_Repuestos" ADD CONSTRAINT "Ordenes_Repuestos_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "OrdenesDeTrabajo"("id_orden") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ordenes_Repuestos" ADD CONSTRAINT "Ordenes_Repuestos_id_repuesto_fkey" FOREIGN KEY ("id_repuesto") REFERENCES "Repuestos"("id_repuesto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facturas" ADD CONSTRAINT "Facturas_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "OrdenesDeTrabajo"("id_orden") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Vehiculo" ADD CONSTRAINT "Historial_Vehiculo_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculos"("id_vehiculo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Vehiculo" ADD CONSTRAINT "Historial_Vehiculo_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "OrdenesDeTrabajo"("id_orden") ON DELETE RESTRICT ON UPDATE CASCADE;
