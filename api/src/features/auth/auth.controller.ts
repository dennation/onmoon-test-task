import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // TODO: Добавить валидацию
    @Post('login')
    @HttpCode(HttpStatus.OK)
    register(@Body('name') name: string): { token: string } {
        const token = this.authService.register(name);
        return { token };
    }
}
