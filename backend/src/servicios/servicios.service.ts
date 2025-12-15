import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateServicioDto) {
    return this.prisma.servicios.create({ data });
  }
  async findAll() {
    return this.prisma.servicios.findMany();
  }
  async findOne(id_servicio: number) {
    const servicio = await this.prisma.servicios.findUnique({ where: { id_servicio } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }
  async update(id_servicio: number, data: UpdateServicioDto) {
    return this.prisma.servicios.update({ where: { id_servicio }, data });
  }
  async remove(id_servicio: number) {
    return this.prisma.servicios.delete({ where: { id_servicio } });
  }
}
