import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './decorators/permissions.decorator';
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }
    const hasPermission = requiredPermissions.some((permission) => 
      user.permissions && user.permissions.includes(permission)
    );
    if (!hasPermission) {
      throw new ForbiddenException(`Acceso denegado. Se requiere uno de los permisos: ${requiredPermissions.join(', ')}`);
    }
    return true;
  }
}
