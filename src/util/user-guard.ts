import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { userProfile } from './keycloak-auth-util';
//import { extractUserFromAuthorizationToken } from './http';

@Injectable()
export class UserGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const user = await userProfile(context.switchToHttp().getRequest());
    return !!user;
  }
}
