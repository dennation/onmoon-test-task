import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import type { User } from 'src/features/auth/auth.types';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    register(name: string): string {
        const user = {
            id: this.generateUniqueId(),
            name: name,
        };

        const payload = { id: user.id, name: user.name };

        return this.jwtService.sign(payload);
    }

    validateToken(token: string): User | null {
        try {
            const { id, name } = this.jwtService.verify<User>(token);
            return { id, name };
        } catch (error) {
            return null;
        }
    }

    private generateUniqueId(): string {
        return randomBytes(16).toString('hex');
    }
}
