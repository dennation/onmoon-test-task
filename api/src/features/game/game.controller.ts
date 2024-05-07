import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from 'src/features/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/features/auth/auth.types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameUpdatedEvent } from 'src/features/game/events/game-updated.event';

@UseGuards(AuthGuard)
@Controller('games')
export class GameController {
    constructor(
        private gameService: GameService,
        private eventEmitter: EventEmitter2,
    ) {}

    @Get()
    async availableGames(@CurrentUser() user: User) {
        return {
            games: await this.gameService.getAvailableGames({
                userId: user.id,
            }),
        };
    }

    @Post()
    async createGame(
        @CurrentUser() user: User,
        @Body('size') size: number,
        @Body('mines') mines: number,
    ) {
        return {
            id: await this.gameService.createGame({
                size,
                user,
                mines,
            }),
        };
    }

    @Post(':gameId/join')
    async joinGame(@CurrentUser() user: User, @Param('gameId') gameId: string) {
        const { _id, players, state } = await this.gameService.joinGame({
            user,
            gameId,
        });

        const e = new GameUpdatedEvent();

        e.id = _id.toString();
        e.players = players;
        e.state = state;

        this.eventEmitter.emit('game.update', e);
    }

    @Get(':gameId')
    async single(@CurrentUser() user: User, @Param('gameId') gameId: string) {
        return await this.gameService.single({
            user,
            gameId,
        });
    }
}
