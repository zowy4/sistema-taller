import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
@Injectable()
export class FacturasService {
  constructor(private prisma: PrismaService) {}
  async create(createFacturaDto: CreateFacturaDto) {
    const orden = await this.prisma.ordenesDeTrabajo.findUnique({
      where: { id_orden: createFacturaDto.id_orden },
      include: { factura: true },
    });
    if (!orden) {
      throw new NotFoundException(`Orden con ID ${createFacturaDto.id_orden} no encontrada`);
    }
    if (orden.estado !== 'completado') {
      throw new BadRequestException('Solo se pueden facturar órdenes completadas');
    }
    if (orden.factura) {
      throw new ConflictException('Esta orden ya tiene una factura generada');
    }
    const factura = await this.prisma.facturas.create({
      data: {
        id_orden: createFacturaDto.id_orden,
        monto: createFacturaDto.monto,
        estado_pago: createFacturaDto.estado_pago || 'pendiente',
        metodo_pago: createFacturaDto.metodo_pago || null,
      },
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
            empleado_responsable: true,
            servicios_asignados: {
              include: {
                servicio: true,
              },
            },
            repuestos_usados: {
              include: {
                repuesto: true,
              },
            },
          },
        },
      },
    });
    return factura;
  }
  async facturarOrden(id_orden: number, metodo_pago?: string) {
    const orden = await this.prisma.ordenesDeTrabajo.findUnique({
      where: { id_orden },
      include: {
        factura: true,
        servicios_asignados: true,
        repuestos_usados: true,
      },
    });
    if (!orden) {
      throw new NotFoundException(`Orden con ID ${id_orden} no encontrada`);
    }
    if (orden.estado !== 'completado') {
      throw new BadRequestException('Solo se pueden facturar órdenes completadas');
    }
    if (orden.factura) {
      throw new ConflictException('Esta orden ya tiene una factura generada');
    }
    let monto = orden.total_real;
    if (!monto) {
      const serviciosTotal = await this.prisma.ordenes_Servicios.aggregate({
        where: { id_orden },
        _sum: { subtotal: true },
      });
      const repuestosTotal = await this.prisma.ordenes_Repuestos.aggregate({
        where: { id_orden },
        _sum: { subtotal: true },
      });
      monto = (serviciosTotal._sum.subtotal || 0) + (repuestosTotal._sum.subtotal || 0);
    }
    const factura = await this.prisma.facturas.create({
      data: {
        id_orden,
        monto,
        estado_pago: metodo_pago ? 'pagada' : 'pendiente',
        metodo_pago: metodo_pago || null,
      },
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
            empleado_responsable: true,
            servicios_asignados: {
              include: {
                servicio: true,
              },
            },
            repuestos_usados: {
              include: {
                repuesto: true,
              },
            },
          },
        },
      },
    });
    if (metodo_pago) {
      await this.prisma.ordenesDeTrabajo.update({
        where: { id_orden },
        data: { estado: 'entregado' },
      });
    }
    return factura;
  }
  async findAll() {
    return this.prisma.facturas.findMany({
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
          },
        },
      },
      orderBy: {
        fecha_factura: 'desc',
      },
    });
  }
  async findOne(id_factura: number) {
    const factura = await this.prisma.facturas.findUnique({
      where: { id_factura },
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
            empleado_responsable: true,
            servicios_asignados: {
              include: {
                servicio: true,
              },
            },
            repuestos_usados: {
              include: {
                repuesto: true,
              },
            },
          },
        },
      },
    });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id_factura} no encontrada`);
    }
    return factura;
  }
  async findByOrden(id_orden: number) {
    const factura = await this.prisma.facturas.findUnique({
      where: { id_orden },
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
            empleado_responsable: true,
            servicios_asignados: {
              include: {
                servicio: true,
              },
            },
            repuestos_usados: {
              include: {
                repuesto: true,
              },
            },
          },
        },
      },
    });
    if (!factura) {
      throw new NotFoundException(`No se encontró factura para la orden ${id_orden}`);
    }
    return factura;
  }
  async update(id_factura: number, updateFacturaDto: UpdateFacturaDto) {
    await this.findOne(id_factura);
    return this.prisma.facturas.update({
      where: { id_factura },
      data: updateFacturaDto,
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
          },
        },
      },
    });
  }
  async remove(id_factura: number) {
    await this.findOne(id_factura);
    return this.prisma.facturas.delete({
      where: { id_factura },
    });
  }
}
