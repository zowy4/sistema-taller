import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPermissions(userId: number, userType: 'empleado' | 'cliente'): Promise<string[]> {
    if (userType === 'cliente') {
      // Los clientes tienen permisos limitados
      return ['clientes:read_own', 'vehiculos:read_own', 'ordenes:read_own'];
    }

    // Para empleados, obtener permisos basados en rol y permisos específicos
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

    // Agregar permisos basados en rol
    const rolePermissions = await this.getRolePermissions(empleado.rol);
    permissions.push(...rolePermissions);

    // Agregar permisos específicos del empleado
    const specificPermissions = empleado.permisos.map(ep => ep.permiso.nombre);
    permissions.push(...specificPermissions);

    return [...new Set(permissions)]; // Eliminar duplicados
  }

  private async getRolePermissions(role: string): Promise<string[]> {
    const rolePermissions: { [key: string]: string[] } = {
      'admin': [
        'clientes:create', 'clientes:read', 'clientes:update', 'clientes:delete',
        'vehiculos:create', 'vehiculos:read', 'vehiculos:update', 'vehiculos:delete',
        'ordenes:create', 'ordenes:read', 'ordenes:update', 'ordenes:delete',
        'facturas:create', 'facturas:read', 'facturas:update', 'facturas:delete',
        'empleados:create', 'empleados:read', 'empleados:update', 'empleados:delete',
        'reportes:read', 'configuracion:update'
      ],
      'supervisor': [
        'clientes:create', 'clientes:read', 'clientes:update',
        'vehiculos:create', 'vehiculos:read', 'vehiculos:update',
        'ordenes:create', 'ordenes:read', 'ordenes:update',
        'facturas:create', 'facturas:read', 'facturas:update',
        'empleados:read', 'reportes:read'
      ],
      'tecnico': [
        'clientes:read',
        'vehiculos:read',
        'ordenes:read', 'ordenes:update',
        'facturas:read'
      ],
      'recepcion': [
        'clientes:create', 'clientes:read', 'clientes:update',
        'vehiculos:create', 'vehiculos:read', 'vehiculos:update',
        'ordenes:create', 'ordenes:read', 'ordenes:update',
        'facturas:create', 'facturas:read'
      ]
    };

    return rolePermissions[role] || [];
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
