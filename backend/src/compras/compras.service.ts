import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService) {}
  async create(createCompraDto: CreateCompraDto) {
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id_proveedor: createCompraDto.id_proveedor },
    });
    if (!proveedor) {
      throw new NotFoundException(
        `Proveedor con ID ${createCompraDto.id_proveedor} no encontrado`,
      );
    }
    for (const item of createCompraDto.repuestos) {
      const repuesto = await this.prisma.repuestos.findUnique({
        where: { id_repuesto: item.id_repuesto },
      });
      if (!repuesto) {
        throw new NotFoundException(
          `Repuesto con ID ${item.id_repuesto} no encontrado`,
        );
      }
    }
    return this.prisma.$transaction(async (prisma) => {
      const compra = await prisma.compras.create({
        data: {
          id_proveedor: createCompraDto.id_proveedor,
          total: createCompraDto.total,
          estado: createCompraDto.estado || 'completada',
          notas: createCompraDto.notas,
        },
      });
      const comprasRepuestos = await Promise.all(
        createCompraDto.repuestos.map((item) => {
          const subtotal = item.cantidad * item.precio_unitario;
          return prisma.compras_Repuestos.create({
            data: {
              id_compra: compra.id_compra,
              id_repuesto: item.id_repuesto,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              subtotal: subtotal,
            },
          });
        }),
      );
      await Promise.all(
        createCompraDto.repuestos.map((item) =>
          prisma.repuestos.update({
            where: { id_repuesto: item.id_repuesto },
            data: {
              stock_actual: {
                increment: item.cantidad,
              },
            },
          }),
        ),
      );
      return prisma.compras.findUnique({
        where: { id_compra: compra.id_compra },
        include: {
          proveedor: true,
          compras_repuestos: {
            include: {
              repuesto: true,
            },
          },
        },
      });
    });
  }
  async findAll() {
    return this.prisma.compras.findMany({
      orderBy: { fecha_compra: 'desc' },
      include: {
        proveedor: true,
        compras_repuestos: {
          include: {
            repuesto: true,
          },
        },
      },
    });
  }
  async findOne(id: number) {
    const compra = await this.prisma.compras.findUnique({
      where: { id_compra: id },
      include: {
        proveedor: true,
        compras_repuestos: {
          include: {
            repuesto: true,
          },
        },
      },
    });
    if (!compra) {
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    }
    return compra;
  }
  async findByProveedor(id_proveedor: number) {
    return this.prisma.compras.findMany({
      where: { id_proveedor },
      orderBy: { fecha_compra: 'desc' },
      include: {
        proveedor: true,
        compras_repuestos: {
          include: {
            repuesto: true,
          },
        },
      },
    });
  }
  async update(id: number, updateCompraDto: UpdateCompraDto) {
    try {
      return await this.prisma.compras.update({
        where: { id_compra: id },
        data: {
          estado: updateCompraDto.estado,
          notas: updateCompraDto.notas,
        },
        include: {
          proveedor: true,
          compras_repuestos: {
            include: {
              repuesto: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }
      throw error;
    }
  }
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.$transaction(async (prisma) => {
      const compra = await prisma.compras.findUnique({
        where: { id_compra: id },
        include: {
          compras_repuestos: true,
        },
      });
      if (!compra) {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }
      await Promise.all(
        compra.compras_repuestos.map((item) =>
          prisma.repuestos.update({
            where: { id_repuesto: item.id_repuesto },
            data: {
              stock_actual: {
                decrement: item.cantidad,
              },
            },
          }),
        ),
      );
      await prisma.compras_Repuestos.deleteMany({
        where: { id_compra: id },
      });
      return prisma.compras.delete({
        where: { id_compra: id },
      });
    });
  }
}
