import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';

@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una compra a un proveedor con transacción
   * AUMENTA el stock de los repuestos automáticamente
   */
  async create(createCompraDto: CreateCompraDto) {
    // Validar que el proveedor existe
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id_proveedor: createCompraDto.id_proveedor },
    });

    if (!proveedor) {
      throw new NotFoundException(
        `Proveedor con ID ${createCompraDto.id_proveedor} no encontrado`,
      );
    }

    // Validar que todos los repuestos existen
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

    // Usar transacción para crear la compra Y actualizar el stock
    return this.prisma.$transaction(async (prisma) => {
      // 1. Crear la compra
      const compra = await prisma.compras.create({
        data: {
          id_proveedor: createCompraDto.id_proveedor,
          total: createCompraDto.total,
          estado: createCompraDto.estado || 'completada',
          notas: createCompraDto.notas,
        },
      });

      // 2. Crear los detalles de la compra (compras_repuestos)
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

      // 3. INCREMENTAR el stock de cada repuesto
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

      // 4. Retornar la compra completa con sus detalles
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
          // No permitimos cambiar proveedor, total o repuestos después de crear
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
    // Verificar si la compra existe
    await this.findOne(id);

    // Usar transacción para eliminar compra Y revertir el stock
    return this.prisma.$transaction(async (prisma) => {
      // 1. Obtener los repuestos de la compra
      const compra = await prisma.compras.findUnique({
        where: { id_compra: id },
        include: {
          compras_repuestos: true,
        },
      });

      if (!compra) {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }

      // 2. DECREMENTAR el stock (revertir el incremento)
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

      // 3. Eliminar los detalles de la compra
      await prisma.compras_Repuestos.deleteMany({
        where: { id_compra: id },
      });

      // 4. Eliminar la compra
      return prisma.compras.delete({
        where: { id_compra: id },
      });
    });
  }
}
