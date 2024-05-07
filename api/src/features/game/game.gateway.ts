import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    type OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/features/auth/auth.service';
import type { GameUpdatedEvent } from 'src/features/game/events/game-updated.event';
import { GameService } from 'src/features/game/game.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/games' })
export class GamesGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    constructor(
        private authService: AuthService,
        private gameService: GameService,
        private eventEmitter: EventEmitter2,
    ) {}

    afterInit() {
        this.eventEmitter.on(
            'game.update',
            ({ id, ...update }: GameUpdatedEvent) => {
                this.server.to(id).emit('updateGame', update);
            },
        );
    }

    handleConnection(client: Socket) {
        const token = client.handshake.query.token;

        if (!token) {
            client.disconnect();
            return;
        }

        const user = this.authService.validateToken(token as string);

        if (!user) {
            client.disconnect();
        } else {
            client.data.user = user;
        }
    }

    @SubscribeMessage('joinGameRoom')
    joinGameRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string },
    ) {
        const { gameId } = data;

        client.join(gameId);
    }

    @SubscribeMessage('openCell')
    async openCell(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { row: number; col: number; gameId: string },
    ) {
        const { row, col, gameId } = data;

        const { moves, players, state } = await this.gameService.makeMove({
            gameId,
            row,
            col,
            user: client.data.user,
        });

        this.server.to(gameId).emit('updateGame', { moves, players, state });
    }
}
