import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Injectable()
export class OrdenesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrdenDto) {
    return this.prisma.$transaction(async (prisma) => {
      // Calcular total estimado sumando servicios y repuestos
      let total_estimado = 0;

      // Calcular total de servicios
      for (const servicio of data.servicios) {
        const servicioData = await prisma.servicios.findUnique({
          where: { id_servicio: servicio.id_servicio },
        });
        if (!servicioData) {
          throw new NotFoundException(`Servicio con ID ${servicio.id_servicio} no encontrado`);
        }
        total_estimado += servicioData.precio * servicio.cantidad;
      }

      // Calcular total de repuestos
      for (const repuesto of data.repuestos) {
        const repuestoData = await prisma.repuestos.findUnique({
          where: { id_repuesto: repuesto.id_repuesto },
        });
        if (!repuestoData) {
          throw new NotFoundException(`Repuesto con ID ${repuesto.id_repuesto} no encontrado`);
        }
        total_estimado += repuestoData.precio_venta * repuesto.cantidad;
      }

      const orden = await prisma.ordenesDeTrabajo.create({
        data: {
          id_cliente: data.id_cliente,
          id_vehiculo: data.id_vehiculo,
          notas: data.notas,
          estado: 'pendiente',
          total_estimado,
        },
      });

      // Crear registros de servicios
      for (const servicio of data.servicios) {
        const servicioData = await prisma.servicios.findUnique({
          where: { id_servicio: servicio.id_servicio },
        });
        
        if (!servicioData) {
          throw new NotFoundException(`Servicio con ID ${servicio.id_servicio} no encontrado`);
        }

        const subtotal = servicioData.precio * servicio.cantidad;
        await prisma.ordenes_Servicios.create({
          data: {
            id_orden: orden.id_orden,
            id_servicio: servicio.id_servicio,
            cantidad: servicio.cantidad,
            precio_unitario: servicioData.precio,
            subtotal,
          },
        });
      }

      // Crear registros de repuestos y decrementar stock
      for (const repuesto of data.repuestos) {
        const repuestoActual = await prisma.repuestos.findUnique({
          where: { id_repuesto: repuesto.id_repuesto },
        });

        if (!repuestoActual) {
          throw new NotFoundException(`Repuesto con ID ${repuesto.id_repuesto} no encontrado`);
        }

        if (repuestoActual.stock_actual < repuesto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${repuestoActual.nombre}. Disponible: ${repuestoActual.stock_actual}, Solicitado: ${repuesto.cantidad}`
          );
        }

        const subtotal = repuestoActual.precio_venta * repuesto.cantidad;
        await prisma.ordenes_Repuestos.create({
          data: {
            id_orden: orden.id_orden,
            id_repuesto: repuesto.id_repuesto,
            cantidad: repuesto.cantidad,
            precio_unitario: repuestoActual.precio_venta,
            subtotal,
          },
        });

        // Decrementar stock del repuesto
        await prisma.repuestos.update({
          where: { id_repuesto: repuesto.id_repuesto },
          data: {
            stock_actual: {
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

  async findByTecnico(id_usuario: number) {
    return this.prisma.ordenesDeTrabajo.findMany({
      where: {
        id_empleado_responsable: id_usuario,
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
      orderBy: {
        fecha_apertura: 'desc',
      },
    });
  }

  async getTecnicoStats(id_usuario: number) {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioSemana = new Date();
    inicioSemana.setDate(ahora.getDate() - 7);

    const [
      totalOrdenes,
      ordenesCompletadas,
      ordenesMes,
      ordenesSemana,
      tiempoPromedio,
    ] = await Promise.all([
      // Total de órdenes asignadas
      this.prisma.ordenesDeTrabajo.count({
        where: { id_empleado_responsable: id_usuario },
      }),
      // Órdenes completadas
      this.prisma.ordenesDeTrabajo.count({
        where: {
          id_empleado_responsable: id_usuario,
          estado: { in: ['completada', 'facturada'] },
        },
      }),
      // Órdenes este mes
      this.prisma.ordenesDeTrabajo.count({
        where: {
          id_empleado_responsable: id_usuario,
          fecha_apertura: { gte: inicioMes },
        },
      }),
      // Órdenes esta semana
      this.prisma.ordenesDeTrabajo.count({
        where: {
          id_empleado_responsable: id_usuario,
          fecha_apertura: { gte: inicioSemana },
        },
      }),
      // Calcular tiempo promedio (órdenes completadas)
      this.prisma.ordenesDeTrabajo.findMany({
        where: {
          id_empleado_responsable: id_usuario,
          estado: { in: ['completada', 'facturada'] },
          fecha_entrega_real: { not: null },
        },
        select: {
          fecha_apertura: true,
          fecha_entrega_real: true,
        },
      }),
    ]);

    // Calcular tiempo promedio en horas
    let tiempoPromedioHoras = 0;
    if (tiempoPromedio.length > 0) {
      const tiempoTotal = tiempoPromedio.reduce((sum, orden) => {
        const diff = new Date(orden.fecha_entrega_real!).getTime() - new Date(orden.fecha_apertura).getTime();
        return sum + diff;
      }, 0);
      tiempoPromedioHoras = Math.round(tiempoTotal / tiempoPromedio.length / (1000 * 60 * 60));
    }

    return {
      totalOrdenes,
      ordenesCompletadas,
      ordenesMes,
      ordenesSemana,
      tiempoPromedioHoras,
      tasaCompletitud: totalOrdenes > 0 ? ((ordenesCompletadas / totalOrdenes) * 100).toFixed(1) : '0',
    };
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
    // Método simplificado - usa updateEstado para cambios de estado
    return this.prisma.ordenesDeTrabajo.update({
      where: { id_orden },
      data: {
        notas: data.notas,
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

