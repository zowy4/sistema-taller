import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}
  async create(createProveedorDto: CreateProveedorDto) {
    try {
      return await this.prisma.proveedores.create({
        data: {
          nombre: createProveedorDto.nombre,
          empresa: createProveedorDto.empresa,
          telefono: createProveedorDto.telefono,
          email: createProveedorDto.email,
          direccion: createProveedorDto.direccion,
          activo: createProveedorDto.activo ?? true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe un proveedor con ese email');
      }
      throw error;
    }
  }
  async findAll() {
    return this.prisma.proveedores.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { compras: true },
        },
      },
    });
  }
  async findAllActive() {
    return this.prisma.proveedores.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }
  async findOne(id: number) {
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id_proveedor: id },
      include: {
        compras: {
          orderBy: { fecha_compra: 'desc' },
          take: 10,
          include: {
            compras_repuestos: {
              include: {
                repuesto: true,
              },
            },
          },
        },
      },
    });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return proveedor;
  }
  async update(id: number, updateProveedorDto: UpdateProveedorDto) {
    try {
      return await this.prisma.proveedores.update({
        where: { id_proveedor: id },
        data: updateProveedorDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe un proveedor con ese email');
      }
      throw error;
    }
  }
  async remove(id: number) {
    try {
      return await this.prisma.proveedores.delete({
        where: { id_proveedor: id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }
      throw error;
    }
  }
  async toggleActive(id: number) {
    const proveedor = await this.findOne(id);
    return this.update(id, { activo: !proveedor.activo });
  }
}
