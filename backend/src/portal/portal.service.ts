import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  // Dashboard Summary
  async getDashboardSummary(idCliente: number) {
    const [vehiculos, ordenesActivas, ordenesCompletadas, totalGastado] = await Promise.all([
      // Total de vehículos del cliente
      this.prisma.vehiculos.count({
        where: { id_cliente: idCliente }
      }),
      
      // Órdenes activas (en_proceso, pendiente)
      this.prisma.ordenesDeTrabajo.count({
        where: {
          id_cliente: idCliente,
          estado: { in: ['pendiente', 'en_proceso'] }
        }
      }),
      
      // Órdenes completadas
      this.prisma.ordenesDeTrabajo.count({
        where: {
          id_cliente: idCliente,
          estado: 'completada'
        }
      }),
      
      // Total gastado (suma de facturas pagadas)
      this.prisma.facturas.aggregate({
        where: {
          orden: {
            id_cliente: idCliente
          },
          estado_pago: 'pagado'
        },
        _sum: { monto: true }
      })
    ]);

    return {
      total_vehiculos: vehiculos,
      ordenes_activas: ordenesActivas,
      ordenes_completadas: ordenesCompletadas,
      total_gastado: totalGastado._sum.monto || 0
    };
  }

  // Perfil del Cliente
  async getMiPerfil(idCliente: number) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id_cliente: idCliente },
      select: {
        id_cliente: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        fecha_alta: true
      }
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  // Actualizar Perfil
  async updateMiPerfil(idCliente: number, data: { telefono?: string; direccion?: string }) {
    return this.prisma.clientes.update({
      where: { id_cliente: idCliente },
      data,
      select: {
        id_cliente: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true
      }
    });
  }

  // Mis Vehículos
  async getMisVehiculos(idCliente: number) {
    const vehiculos = await this.prisma.vehiculos.findMany({
      where: { id_cliente: idCliente },
      include: {
        _count: {
          select: {
            ordenes_trabajo: {
              where: { estado: 'completada' }
            }
          }
        },
        ordenes_trabajo: {
          where: { estado: { in: ['pendiente', 'en_proceso'] } },
          take: 1,
          orderBy: { fecha_apertura: 'desc' }
        }
      }
    });

    return vehiculos.map(v => ({
      id_vehiculo: v.id_vehiculo,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      placa: v.placa,
      detalles: v.detalles,
      servicios_completados: v._count.ordenes_trabajo,
      orden_activa: v.ordenes_trabajo[0] ? {
        id_orden: v.ordenes_trabajo[0].id_orden,
        estado: v.ordenes_trabajo[0].estado,
        fecha_entrada: v.ordenes_trabajo[0].fecha_apertura
      } : null
    }));
  }

  // Historial de un Vehículo
  async getHistorialVehiculo(idCliente: number, idVehiculo: number) {
    // Verificar que el vehículo pertenece al cliente
    const vehiculo = await this.prisma.vehiculos.findFirst({
      where: {
        id_vehiculo: idVehiculo,
        id_cliente: idCliente
      }
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado o no pertenece al cliente');
    }

    const ordenes = await this.prisma.ordenesDeTrabajo.findMany({
      where: { id_vehiculo: idVehiculo },
      include: {
        empleado_responsable: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        factura: {
          select: {
            monto: true,
            estado_pago: true
          }
        }
      },
      orderBy: { fecha_apertura: 'desc' }
    });

    return ordenes;
  }

  // Mis Órdenes
  async getMisOrdenes(idCliente: number, estado?: string) {
    const where: any = {
      id_cliente: idCliente
    };

    if (estado) {
      where.estado = estado;
    }

    const ordenes = await this.prisma.ordenesDeTrabajo.findMany({
      where,
      include: {
        vehiculo: {
          select: {
            marca: true,
            modelo: true,
            placa: true
          }
        },
        empleado_responsable: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        factura: {
          select: {
            id_factura: true,
            monto: true,
            estado_pago: true
          }
        }
      },
      orderBy: { fecha_apertura: 'desc' }
    });

    return ordenes;
  }

  // Detalle de una Orden
  async getDetalleOrden(idCliente: number, idOrden: number) {
    const orden = await this.prisma.ordenesDeTrabajo.findFirst({
      where: {
        id_orden: idOrden,
        id_cliente: idCliente
      },
      include: {
        vehiculo: {
          select: {
            marca: true,
            modelo: true,
            placa: true,
            anio: true
          }
        },
        empleado_responsable: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        factura: true,
        servicios_asignados: {
          include: {
            servicio: true
          }
        },
        repuestos_usados: {
          include: {
            repuesto: true
          }
        }
      }
    });

    if (!orden) {
      throw new NotFoundException('Orden no encontrada o no pertenece al cliente');
    }

    return orden;
  }

  // Mis Facturas
  async getMisFacturas(idCliente: number, estadoPago?: string) {
    const where: any = {
      orden: {
        id_cliente: idCliente
      }
    };

    if (estadoPago) {
      where.estado_pago = estadoPago;
    }

    const facturas = await this.prisma.facturas.findMany({
      where,
      include: {
        orden: {
          include: {
            vehiculo: {
              select: {
                marca: true,
                modelo: true,
                placa: true
              }
            }
          }
        }
      },
      orderBy: { fecha_factura: 'desc' }
    });

    return facturas;
  }

  // Descargar PDF de Factura (placeholder)
  async getFacturaPDF(idCliente: number, idFactura: number) {
    // Verificar que la factura pertenece al cliente
    const factura = await this.prisma.facturas.findFirst({
      where: {
        id_factura: idFactura,
        orden: {
          id_cliente: idCliente
        }
      },
      include: {
        orden: {
          include: {
            vehiculo: true,
            servicios_asignados: {
              include: {
                servicio: true
              }
            },
            repuestos_usados: {
              include: {
                repuesto: true
              }
            }
          }
        }
      }
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada o no pertenece al cliente');
    }

    // Aquí iría la lógica para generar el PDF
    // Por ahora retornamos los datos de la factura
    return factura;
  }
}
