import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/features/game/game.entity';
import { GameModule } from 'src/features/game/game.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'mongodb',
            url: process.env.MONGO_URI,
            entities: [Game],
        }),
        EventEmitterModule.forRoot(),
        TypeOrmModule.forFeature([Game]),
        GameModule,
    ],
})
export class AppModule {}
