import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class RepuestosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo repuesto
   */
  async createRepuesto(createRepuestoDto: CreateRepuestoDto) {
    try {
      return await this.prisma.repuestos.create({
        data: createRepuestoDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe un repuesto con ese nombre');
      }
      throw error;
    }
  }

  /**
   * Obtener todos los repuestos
   */
  async getAllRepuestos() {
    return await this.prisma.repuestos.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Obtener repuestos con stock bajo (por debajo del nivel mínimo)
   */
  async getRepuestosBajoStock() {
    const repuestos = await this.prisma.repuestos.findMany({
      where: {
        stock_actual: {
          lte: this.prisma.repuestos.fields.stock_minimo,
        },
      },
      orderBy: {
        stock_actual: 'asc',
      },
    });
    return repuestos;
  }

  /**
   * Obtener un repuesto por ID
   */
  async getRepuestoById(id: number) {
    const repuesto = await this.prisma.repuestos.findUnique({
      where: { id_repuesto: id },
    });

    if (!repuesto) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }

    return repuesto;
  }

  /**
   * Actualizar un repuesto
   */
  async updateRepuesto(id: number, updateRepuestoDto: UpdateRepuestoDto) {
    await this.getRepuestoById(id);

    try {
      return await this.prisma.repuestos.update({
        where: { id_repuesto: id },
        data: updateRepuestoDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe un repuesto con ese nombre');
      }
      throw error;
    }
  }

  /**
   * Eliminar un repuesto
   */
  async deleteRepuesto(id: number) {
    await this.getRepuestoById(id);

    try {
      return await this.prisma.repuestos.delete({
        where: { id_repuesto: id },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'No se puede eliminar el repuesto porque está siendo usado en órdenes de trabajo',
        );
      }
      throw error;
    }
  }

  /**
   * Ajustar stock de un repuesto
   * cantidad positiva = entrada de stock
   * cantidad negativa = salida de stock
   */
  async adjustStock(id: number, adjustStockDto: AdjustStockDto) {
    const repuesto = await this.getRepuestoById(id);

    const newStock = repuesto.stock_actual + adjustStockDto.cantidad;

    if (newStock < 0) {
      throw new BadRequestException(
        `No hay suficiente stock. Stock actual: ${repuesto.stock_actual}`,
      );
    }

    return await this.prisma.repuestos.update({
      where: { id_repuesto: id },
      data: {
        stock_actual: newStock,
      },
    });
  }
}

