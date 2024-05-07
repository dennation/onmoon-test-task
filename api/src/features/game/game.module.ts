import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Game } from './game.entity';
import { AuthModule } from 'src/features/auth/auth.module';
import { GamesGateway } from 'src/features/game/game.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Game])],
    providers: [GameService, GamesGateway, EventEmitter2],
    controllers: [GameController],
})
export class GameModule {}
