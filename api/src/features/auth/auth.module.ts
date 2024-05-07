import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from 'src/features/auth/auth.controller';

@Module({
    imports: [
        JwtModule.register({
            secret: 'secret_key', // TODO: заменить на переменную окружения
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
