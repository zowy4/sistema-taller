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

  /**
   * Crea un nuevo cliente
   */
  async createClient(data: CreateClientDto & { password?: string }): Promise<Clientes> {
    try {
      const payload: any = { ...data };
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(data.password, salt);
      }

      return await this.prisma.clientes.create({ data: payload });
    } catch (error) {
      // Comprobación de error de Prisma
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[];
          if (Array.isArray(target) && target.includes('email')) {
            throw new ConflictException('Ya existe un cliente con este email.');
          }
        }
      }


      // 3. Lanza un error genérico SÓLO si no fue un error manejado
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  /**
   * Obtiene todos los clientes
   */
  async getAllClients(): Promise<Clientes[]> {
    return this.prisma.clientes.findMany();
  }

  /**
   * Busca un cliente por su ID
   */
  async getClientById(id: number): Promise<Clientes> {
    const client = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });

    if (!client) {
      // 4. ¡CORRECCIÓN! Se añadieron los backticks (`)
      throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
    }

    return client;
  }

  /**
   * Actualiza un cliente por ID
   */
  async updateClient(id: number, data: Partial<CreateClientDto>): Promise<Clientes> {
    await this.getClientById(id); // Reutilizamos la validación 404

    try {
      return await this.prisma.clientes.update({
        where: { id_cliente: id }, // <-- Simplificado
        data,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  /**
   * Elimina un cliente por ID
   */
  async deleteClient(id: number): Promise<Clientes> {
    await this.getClientById(id); // Reutilizamos la validación 404

    try {
      return await this.prisma.clientes.delete({
        where: { id_cliente: id }, // <-- Simplificado
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }
}