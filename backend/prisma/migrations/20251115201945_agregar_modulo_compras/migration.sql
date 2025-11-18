-- CreateTable
CREATE TABLE "Proveedores" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proveedores_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "Compras" (
    "id_compra" SERIAL NOT NULL,
    "fecha_compra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'completada',
    "notas" TEXT,
    "id_proveedor" INTEGER NOT NULL,

    CONSTRAINT "Compras_pkey" PRIMARY KEY ("id_compra")
);

-- CreateTable
CREATE TABLE "Compras_Repuestos" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "id_compra" INTEGER NOT NULL,
    "id_repuesto" INTEGER NOT NULL,

    CONSTRAINT "Compras_Repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proveedores_email_key" ON "Proveedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Compras_Repuestos_id_compra_id_repuesto_key" ON "Compras_Repuestos"("id_compra", "id_repuesto");

-- AddForeignKey
ALTER TABLE "Compras" ADD CONSTRAINT "Compras_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "Proveedores"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compras_Repuestos" ADD CONSTRAINT "Compras_Repuestos_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "Compras"("id_compra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compras_Repuestos" ADD CONSTRAINT "Compras_Repuestos_id_repuesto_fkey" FOREIGN KEY ("id_repuesto") REFERENCES "Repuestos"("id_repuesto") ON DELETE RESTRICT ON UPDATE CASCADE;
