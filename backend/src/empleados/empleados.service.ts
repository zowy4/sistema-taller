import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpleadosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmpleadoDto: CreateEmpleadoDto) {
    // Verificar si el email ya existe
    const exists = await this.prisma.empleados.findUnique({
      where: { email: createEmpleadoDto.email },
    });

    if (exists) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createEmpleadoDto.password, 10);

    // Mapear estado string -> boolean activo (por esquema Prisma)
    const activo = (createEmpleadoDto.estado ?? 'activo') === 'activo';

    // Crear el empleado (ahora con telefono y direccion)
    const empleado = await this.prisma.empleados.create({
      data: {
        nombre: createEmpleadoDto.nombre,
        apellido: createEmpleadoDto.apellido,
        email: createEmpleadoDto.email,
        password: hashedPassword,
        telefono: createEmpleadoDto.telefono,
        direccion: createEmpleadoDto.direccion,
        rol: createEmpleadoDto.rol,
        activo,
      },
    });

    // No devolver la contraseña; exponer 'estado' derivado para el frontend
    const { password, ...rest } = empleado as any;
    return { ...rest, estado: rest.activo ? 'activo' : 'inactivo' };
  }

  async findAll() {
    const empleados = await this.prisma.empleados.findMany({
      orderBy: { id_empleado: 'desc' },
    });

    // No devolver contraseñas; añadir 'estado' derivado
    return empleados.map((e: any) => {
      const { password, ...rest } = e;
      return { ...rest, estado: rest.activo ? 'activo' : 'inactivo' };
    });
  }

  async findOne(id: number) {
    const empleado = await this.prisma.empleados.findUnique({
      where: { id_empleado: id },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // No devolver la contraseña; añadir 'estado' derivado
    const { password, ...rest } = empleado as any;
    return { ...rest, estado: rest.activo ? 'activo' : 'inactivo' };
  }

  async update(id: number, updateEmpleadoDto: UpdateEmpleadoDto) {
    // Verificar que el empleado existe
    await this.findOne(id);

    // Construir data permitida según esquema Prisma (ahora incluye telefono y direccion)
    const data: any = {
      nombre: updateEmpleadoDto.nombre,
      apellido: updateEmpleadoDto.apellido,
      email: updateEmpleadoDto.email,
      telefono: updateEmpleadoDto.telefono,
      direccion: updateEmpleadoDto.direccion,
      rol: updateEmpleadoDto.rol,
    };

    // Mapear estado -> activo si viene
    if (typeof updateEmpleadoDto.estado !== 'undefined') {
      data.activo = updateEmpleadoDto.estado === 'activo';
    }

    // Si se proporciona una nueva contraseña, hashearla
    if (updateEmpleadoDto.password) {
      data.password = await bcrypt.hash(updateEmpleadoDto.password, 10);
    }

    // Si se está cambiando el email, verificar que no exista
    if (updateEmpleadoDto.email) {
      const exists = await this.prisma.empleados.findFirst({
        where: {
          email: updateEmpleadoDto.email,
          NOT: { id_empleado: id },
        },
      });

      if (exists) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const empleado = await this.prisma.empleados.update({
      where: { id_empleado: id },
      data,
    });

    // No devolver la contraseña; añadir 'estado' derivado
    const { password, ...rest } = empleado as any;
    return { ...rest, estado: rest.activo ? 'activo' : 'inactivo' };
  }

  async remove(id: number) {
    // Verificar que el empleado existe
    await this.findOne(id);

    // En lugar de eliminar, mejor desactivar
    const empleado = await this.prisma.empleados.update({
      where: { id_empleado: id },
      data: { activo: false },
    });

    const { password, ...rest } = empleado as any;
    return { ...rest, estado: rest.activo ? 'activo' : 'inactivo' };
  }
}
