import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from 'src/features/auth/auth.service';
import { extractJwt } from 'src/common/utils';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = extractJwt(context);

        if (!token) {
            return false;
        }

        const user = this.authService.validateToken(token);

        if (!user) {
            return false;
        }

        request.user = user;
        return true;
    }
}
