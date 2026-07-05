import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ADMIN_LEVELS_KEY } from '../decorators/admin-levels.decorator';
import { JwtPayload } from '../interfaces/jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredAdminLevels = this.reflector.getAllAndOverride<string[]>(
      ADMIN_LEVELS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredAdminLevels) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    if (requiredAdminLevels) {
      if (
        user.role !== 'ADMIN' ||
        !user.adminLevel ||
        !requiredAdminLevels.includes(user.adminLevel)
      ) {
        throw new ForbiddenException(
          'Your admin level does not permit this action',
        );
      }
    }

    return true;
  }
}
