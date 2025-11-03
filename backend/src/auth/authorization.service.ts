import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPermissions(userId: number, userType: 'empleado' | 'cliente'): Promise<string[]> {
    if (userType === 'cliente') {
      return ['clientes:read_own', 'vehiculos:read_own', 'ordenes:read_own'];
    }

    const empleado = await this.prisma.empleados.findUnique({
      where: { id_empleado: userId },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    if (!empleado) {
      return [];
    }

    const permissions: string[] = [];

    const rolePermissions = await this.getRolePermissions(empleado.rol);
    permissions.push(...rolePermissions);

    const specificPermissions = empleado.permisos.map(ep => ep.permiso.nombre);
    permissions.push(...specificPermissions);

    return [...new Set(permissions)];
  }

  private async getRolePermissions(role: string): Promise<string[]> {
    const roleData = await this.prisma.roles.findFirst({
      where: { nombre: role },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    if (!roleData) {
      return [];
    }

    return roleData.permisos.map(rp => rp.permiso.nombre);
  }

  async hasPermission(userId: number, userType: 'empleado' | 'cliente', permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, userType);
    return permissions.includes(permission);
  }

  async canAccessResource(userId: number, userType: 'empleado' | 'cliente', resource: string, action: string): Promise<boolean> {
    const permission = `${resource}:${action}`;
    return this.hasPermission(userId, userType, permission);
  }
}
