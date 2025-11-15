import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(private prisma: PrismaService) {}

  async create(createVehiculoDto: CreateVehiculoDto) {
    try {
      return await this.prisma.vehiculos.create({
        data: {
          placa: createVehiculoDto.placa,
          vin: createVehiculoDto.vin,
          marca: createVehiculoDto.marca,
          modelo: createVehiculoDto.modelo,
          anio: createVehiculoDto.anio,
          id_cliente: createVehiculoDto.id_cliente,
          detalles: createVehiculoDto.detalles || null,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('La placa ya está registrada');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.vehiculos.findMany({
      include: { cliente: true },
      orderBy: { placa: 'asc' },
    });
  }

  async findOne(id: number) {
    const vehiculo = await this.prisma.vehiculos.findUnique({
      where: { id_vehiculo: id },
      include: { cliente: true },
    });
    if (!vehiculo) throw new NotFoundException('Vehículo no encontrado');
    return vehiculo;
  }

  async update(id: number, dto: UpdateVehiculoDto) {
    try {
      // Mapear solo campos permitidos para evitar errores por propiedades desconocidas
      const data: any = {
        ...(dto.placa !== undefined ? { placa: dto.placa } : {}),
        ...(dto.vin !== undefined ? { vin: dto.vin } : {}),
        ...(dto.marca !== undefined ? { marca: dto.marca } : {}),
        ...(dto.modelo !== undefined ? { modelo: dto.modelo } : {}),
        ...(dto.anio !== undefined ? { anio: dto.anio } : {}),
        ...(dto.id_cliente !== undefined ? { id_cliente: dto.id_cliente } : {}),
        ...(dto.detalles !== undefined ? { detalles: dto.detalles ?? null } : {}),
      };

      return await this.prisma.vehiculos.update({
        where: { id_vehiculo: id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Vehículo no encontrado');
      }
      if (error.code === 'P2002') {
        // Conflictos de unicidad (placa, vin, etc.)
        throw new BadRequestException('Ya existe un registro con los mismos datos únicos (placa o VIN)');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.vehiculos.delete({
        where: { id_vehiculo: id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Vehículo no encontrado');
      }
      throw error;
    }
  }
}
