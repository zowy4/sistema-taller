import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { Prisma, Clientes } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClient(data: CreateClientDto & { password?: string }): Promise<Clientes> {
    try {
      const payload: any = { ...data };
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(data.password, salt);
      }

      return await this.prisma.clientes.create({ data: payload });
    } catch (error) {
      console.error('--- ERROR DETALLADO ---', error);

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[];
          if (Array.isArray(target) && target.includes('email')) {
            throw new ConflictException('Ya existe un cliente con este email.');
          }
        }
      }

      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  async getAllClients(): Promise<Clientes[]> {
    return this.prisma.clientes.findMany();
  }

  async getClientById(id: number): Promise<Clientes> {
    const client = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
    }

    return client;
  }

  async updateClient(id: number, data: Partial<CreateClientDto>): Promise<Clientes> {
    await this.getClientById(id);

    try {
      return await this.prisma.clientes.update({
        where: { id_cliente: id },
        data,
      });
    } catch (error) {
      console.error('--- ERROR ACTUALIZANDO CLIENTE ---', error);
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async deleteClient(id: number): Promise<Clientes> {
    await this.getClientById(id);

    try {
      return await this.prisma.clientes.delete({
        where: { id_cliente: id },
      });
    } catch (error) {
      console.error('--- ERROR ELIMINANDO CLIENTE ---', error);
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }
}