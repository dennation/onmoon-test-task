import { ExecutionContext } from '@nestjs/common';

export function extractJwt(context: ExecutionContext): string | null {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    return authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
}
