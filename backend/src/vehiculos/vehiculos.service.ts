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
      return await this.prisma.vehiculos.update({
        where: { id_vehiculo: id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Vehículo no encontrado');
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
