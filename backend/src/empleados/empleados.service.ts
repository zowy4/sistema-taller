import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class EmpleadosService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createEmpleadoDto: CreateEmpleadoDto) {
    const exists = await this.prisma.empleados.findUnique({
      where: { email: createEmpleadoDto.email },
    });
    if (exists) {
      throw new ConflictException('El email ya está registrado');
    }
    const hashedPassword = await bcrypt.hash(createEmpleadoDto.password, 10);
    const activo = (createEmpleadoDto.estado ?? 'activo') === 'activo';
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
    const { password, ...rest } = empleado as any;
    return { 
      ...rest, 
      cargo: rest.rol,
      estado: rest.activo ? 'activo' : 'inactivo' 
    };
  }
  async findAll() {
    const empleados = await this.prisma.empleados.findMany({
      orderBy: { id_empleado: 'desc' },
    });
    return empleados.map((e: any) => {
      const { password, ...rest } = e;
      return { 
        ...rest, 
        cargo: rest.rol,
        estado: rest.activo ? 'activo' : 'inactivo' 
      };
    });
  }
  async findOne(id: number) {
    const empleado = await this.prisma.empleados.findUnique({
      where: { id_empleado: id },
    });
    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }
    const { password, ...rest } = empleado as any;
    return { 
      ...rest, 
      cargo: rest.rol,
      estado: rest.activo ? 'activo' : 'inactivo' 
    };
  }
  async update(id: number, updateEmpleadoDto: UpdateEmpleadoDto) {
    await this.findOne(id);
    const data: any = {
      nombre: updateEmpleadoDto.nombre,
      apellido: updateEmpleadoDto.apellido,
      email: updateEmpleadoDto.email,
      telefono: updateEmpleadoDto.telefono,
      direccion: updateEmpleadoDto.direccion,
      rol: updateEmpleadoDto.rol,
    };
    if (typeof updateEmpleadoDto.estado !== 'undefined') {
      data.activo = updateEmpleadoDto.estado === 'activo';
    }
    if (updateEmpleadoDto.password) {
      data.password = await bcrypt.hash(updateEmpleadoDto.password, 10);
    }
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
    const { password, ...rest } = empleado as any;
    return { 
      ...rest, 
      cargo: rest.rol,
      estado: rest.activo ? 'activo' : 'inactivo' 
    };
  }
  async remove(id: number) {
    await this.findOne(id);
    const empleado = await this.prisma.empleados.update({
      where: { id_empleado: id },
      data: { activo: false },
    });
    const { password, ...rest } = empleado as any;
    return { ...rest, estado: rest.activo ? 'activo' : 'inactivo' };
  }
}
