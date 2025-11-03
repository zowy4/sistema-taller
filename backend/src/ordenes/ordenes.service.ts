import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Injectable()
export class OrdenesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrdenDto) {
    return this.prisma.$transaction(async (prisma) => {
      const orden = await prisma.ordenesDeTrabajo.create({
        data: {
          id_cliente: data.id_cliente,
          id_vehiculo: data.id_vehiculo,
          id_empleado_responsable: data.id_empleado_responsable,
          fecha_entrega_estimada: new Date(data.fecha_entrega_estimada),
          fecha_entrega_real: data.total_real ? new Date() : null,
          estado: data.estado,
          total_estimado: data.total_estimado,
          total_real: data.total_real || null,
        },
      });

      for (const servicio of data.servicios) {
        const subtotal = servicio.cantidad * servicio.precio_unitario;
        await prisma.ordenes_Servicios.create({
          data: {
            id_orden: orden.id_orden,
            id_servicio: servicio.id_servicio,
            cantidad: servicio.cantidad,
            precio_unitario: servicio.precio_unitario,
            subtotal,
          },
        });
      }

      for (const repuesto of data.repuestos) {
        const repuestoActual = await prisma.repuestos.findUnique({
          where: { id_repuesto: repuesto.id_repuesto },
        });

        if (!repuestoActual) {
          throw new NotFoundException(`Repuesto con ID ${repuesto.id_repuesto} no encontrado`);
        }

        if (repuestoActual.cantidad_existente < repuesto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${repuestoActual.nombre}. Disponible: ${repuestoActual.cantidad_existente}, Solicitado: ${repuesto.cantidad}`
          );
        }

        const subtotal = repuesto.cantidad * repuesto.precio_unitario;
        await prisma.ordenes_Repuestos.create({
          data: {
            id_orden: orden.id_orden,
            id_repuesto: repuesto.id_repuesto,
            cantidad: repuesto.cantidad,
            precio_unitario: repuesto.precio_unitario,
            subtotal,
          },
        });

        await prisma.repuestos.update({
          where: { id_repuesto: repuesto.id_repuesto },
          data: {
            cantidad_existente: {
              decrement: repuesto.cantidad,
            },
          },
        });
      }

      // Retornar la orden con sus relaciones
      return prisma.ordenesDeTrabajo.findUnique({
        where: { id_orden: orden.id_orden },
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
      });
    });
  }

  async findAll() {
    return this.prisma.ordenesDeTrabajo.findMany({
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
      orderBy: {
        fecha_apertura: 'desc',
      },
    });
  }

  async findOne(id_orden: number) {
    const orden = await this.prisma.ordenesDeTrabajo.findUnique({
      where: { id_orden },
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
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }

  async update(id_orden: number, data: UpdateOrdenDto) {
    return this.prisma.ordenesDeTrabajo.update({
      where: { id_orden },
      data: {
        estado: data.estado,
        fecha_entrega_real: data.total_real ? new Date() : undefined,
        total_real: data.total_real,
      },
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
    });
  }

  async updateEstado(id_orden: number, estado: string) {
    // Validar transiciones de estado
    const orden = await this.findOne(id_orden);
    
    // Validaciones de flujo de estado
    const estadosValidos = ['pendiente', 'en_proceso', 'completado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      throw new BadRequestException(`Estado inválido: ${estado}`);
    }

    // Lógica de negocio: solo se puede facturar si está completado
    if (estado === 'entregado' && orden.estado !== 'completado') {
      throw new BadRequestException('Solo se puede marcar como entregado si está completado');
    }

    // Si se completa, calcular total_real sumando servicios y repuestos
    let total_real = orden.total_real;
    let fecha_entrega_real = orden.fecha_entrega_real;

    if (estado === 'completado' && orden.estado !== 'completado') {
      const serviciosTotal = await this.prisma.ordenes_Servicios.aggregate({
        where: { id_orden },
        _sum: { subtotal: true },
      });

      const repuestosTotal = await this.prisma.ordenes_Repuestos.aggregate({
        where: { id_orden },
        _sum: { subtotal: true },
      });

      total_real = (serviciosTotal._sum.subtotal || 0) + (repuestosTotal._sum.subtotal || 0);
      fecha_entrega_real = new Date();
    }

    return this.prisma.ordenesDeTrabajo.update({
      where: { id_orden },
      data: {
        estado,
        total_real,
        fecha_entrega_real,
      },
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
        factura: true,
      },
    });
  }

  async remove(id_orden: number) {
    // En producción, considera marcar como "cancelada" en lugar de eliminar
    return this.prisma.ordenesDeTrabajo.delete({
      where: { id_orden },
    });
  }
}

