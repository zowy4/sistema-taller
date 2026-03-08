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
import { EncryptionService } from '../common/encryption/encryption.service';
@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private encryptSensitiveFields(payload: Partial<CreateClientDto>): Partial<CreateClientDto> {
    const next = { ...payload };

    if (typeof next.direccion === 'string' && next.direccion.length > 0) {
      next.direccion = this.encryptionService.encrypt(next.direccion);
    }

    return next;
  }

  private decryptSensitiveFields(client: Clientes): Clientes {
    const next = { ...client };

    if (
      typeof next.direccion === 'string' &&
      next.direccion.length > 0 &&
      this.encryptionService.isEncrypted(next.direccion)
    ) {
      next.direccion = this.encryptionService.decrypt(next.direccion);
    }

    return next;
  }

  async createClient(data: CreateClientDto & { password?: string }): Promise<Clientes> {
    try {
      const payload: any = { ...data };
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(data.password, salt);
      }
      const encryptedPayload = this.encryptSensitiveFields(payload);
      const created = await this.prisma.clientes.create({
        data: encryptedPayload as Prisma.ClientesCreateInput,
      });
      return this.decryptSensitiveFields(created);
    } catch (error) {
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
    const clients = await this.prisma.clientes.findMany();
    return clients.map((client) => this.decryptSensitiveFields(client));
  }
  async getClientById(id: number): Promise<Clientes> {
    const client = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
    }
    return this.decryptSensitiveFields(client);
  }
  async updateClient(id: number, data: Partial<CreateClientDto>): Promise<Clientes> {
    await this.getClientById(id); 
    try {
      const encryptedPayload = this.encryptSensitiveFields(data);
      const updated = await this.prisma.clientes.update({
        where: { id_cliente: id }, 
        data: encryptedPayload as Prisma.ClientesUpdateInput,
      });
      return this.decryptSensitiveFields(updated);
    } catch (error) {
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
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }
}
