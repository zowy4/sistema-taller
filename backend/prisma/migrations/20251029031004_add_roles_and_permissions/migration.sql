-- CreateTable
CREATE TABLE "Roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "Permisos" (
    "id_permiso" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,

    CONSTRAINT "Permisos_pkey" PRIMARY KEY ("id_permiso")
);

-- CreateTable
CREATE TABLE "Rol_Permiso" (
    "id_rol" INTEGER NOT NULL,
    "id_permiso" INTEGER NOT NULL,

    CONSTRAINT "Rol_Permiso_pkey" PRIMARY KEY ("id_rol","id_permiso")
);

-- CreateTable
CREATE TABLE "Empleado_Permiso" (
    "id_empleado" INTEGER NOT NULL,
    "id_permiso" INTEGER NOT NULL,

    CONSTRAINT "Empleado_Permiso_pkey" PRIMARY KEY ("id_empleado","id_permiso")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_nombre_key" ON "Roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Permisos_nombre_key" ON "Permisos"("nombre");

-- AddForeignKey
ALTER TABLE "Rol_Permiso" ADD CONSTRAINT "Rol_Permiso_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rol_Permiso" ADD CONSTRAINT "Rol_Permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "Permisos"("id_permiso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado_Permiso" ADD CONSTRAINT "Empleado_Permiso_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleados"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado_Permiso" ADD CONSTRAINT "Empleado_Permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "Permisos"("id_permiso") ON DELETE RESTRICT ON UPDATE CASCADE;
