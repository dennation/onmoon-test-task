import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Game } from './game.entity';
import { GameState } from './game-state.enum';
import type { User } from 'src/features/auth/auth.types';

interface CreateGameArgs {
    size: number;
    mines: number;
    user: User;
}

interface MakeMoveArgs {
    gameId: string;
    user: User;
    row: number;
    col: number;
}

interface GetAvailableGamesArgs {
    userId: string;
}

interface JoinGameArgs {
    user: User;
    gameId: string;
}

interface SingleArgs {
    user: User;
    gameId: string;
}

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: MongoRepository<Game>,
    ) {}

    async single(args: SingleArgs) {
        const { gameId, user } = args;

        const game = await this.gameRepository.findOne({
            where: {
                _id: new ObjectId(gameId),
            },
            select: [
                '_id',
                'createdBy',
                'mines',
                'moves',
                'players',
                'size',
                'state',
            ],
        });

        if (!game) {
            throw new NotFoundException('Game not found');
        }

        if (!game.players.find((player) => player.id === user.id)) {
            throw new UnauthorizedException();
        }

        return game;
    }

    async joinGame(args: JoinGameArgs) {
        const { gameId, user } = args;

        // TODO: Добавить транзакцию
        const game = await this.gameRepository.findOne({
            where: {
                _id: new ObjectId(gameId),
                state: GameState.Created,
            },
        });

        if (!game) {
            throw new NotFoundException('Game not found');
        }

        game.players.push({
            ...user,
            score: 0,
        });

        game.state = GameState.Started;

        return await this.gameRepository.save(game);
    }

    async getAvailableGames(args: GetAvailableGamesArgs) {
        // TODO: Добавить пагинацию
        return await this.gameRepository.find({
            where: {
                $or: [
                    {
                        state: GameState.Created,
                    },
                    {
                        state: GameState.Started,
                        players: {
                            $elemMatch: {
                                id: args.userId,
                            },
                        },
                    },
                ],
            },
            select: [
                '_id',
                'createdAt',
                'createdBy',
                'mines',
                'size',
                'players',
                'state',
            ],
            order: {
                state: 'DESC',
                createdAt: 'DESC',
            },
        });
    }

    async createGame(args: CreateGameArgs): Promise<string> {
        const { size, mines, user } = args;
        const game = new Game();
        game.createdAt = new Date();
        game.createdBy = user.id;
        game.state = GameState.Created;
        game.gameBoard = this.initializeGameBoard(size, mines);
        game.players = [{ ...user, score: 0 }];
        game.size = size;
        game.mines = mines;
        game.moves = [];

        const { _id } = await this.gameRepository.save(game);

        return _id.toString();
    }

    async makeMove(args: MakeMoveArgs): Promise<Game> {
        const { gameId, user, row, col } = args;
        const game = await this.gameRepository.findOneBy({
            _id: new ObjectId(gameId),
            state: GameState.Started,
        });

        if (!game) {
            throw new NotFoundException('Game not foung');
        }

        // Запрещаем открывать ту же клетку несколько раз
        if (game.moves.find((move) => move.col === col && move.row === row)) {
            throw new BadRequestException();
        }

        if (!this.canMakeMove(game, user.id)) {
            throw new UnauthorizedException();
        }

        if (game.gameBoard[row][col] === -1) {
            const player = game.players.find((p) => p.id === user.id);

            if (player) {
                player.score += 1;
            }
        }

        game.moves.push({
            userId: user.id,
            row,
            col,
            result: game.gameBoard[row][col],
            timestamp: new Date(),
        });

        const totalPoints = game.players.reduce(
            (summ, { score }) => summ + score,
            0,
        );

        if (totalPoints >= game.mines) {
            game.state = GameState.Finished;
        }

        return this.gameRepository.save(game);
    }

    private canMakeMove(game: Game, userId: string) {
        // Игрок должен быть участником игры
        if (!game.players.find((player) => player.id === userId)) {
            return false;
        }

        const lastMove = game.moves[game.moves.length - 1];

        // Первый ход за создателем игры
        if (!lastMove) {
            return userId === game.createdBy;
        }

        // Если пользователь нашел алмаз, может сделать еще один ход
        if (lastMove.result < 0) {
            return lastMove.userId === userId;
        }

        // Передаем ход другому игроку
        return userId !== lastMove.userId;
    }

    private initializeGameBoard(size: number, mines: number): number[][] {
        const board = Array.from({ length: size }, () => Array(size).fill(0));
        this.placeMines(board, mines);
        this.calculateMinesAround(board);
        return board;
    }

    private placeMines(board: number[][], mines: number): void {
        let placedMines = 0;
        const size = board.length;

        while (placedMines < mines) {
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            if (board[row][col] === 0) {
                board[row][col] = -1;
                placedMines++;
            }
        }
    }

    private calculateMinesAround(board: number[][]): void {
        const size = board.length;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (board[row][col] === -1) continue;
                board[row][col] = this.countAdjacentMines(board, row, col);
            }
        }
    }

    private countAdjacentMines(
        board: number[][],
        row: number,
        col: number,
    ): number {
        const size = board.length;
        let minesCount = 0;
        const directions = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];

        directions.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;

            if (
                newRow >= 0 &&
                newRow < size &&
                newCol >= 0 &&
                newCol < size &&
                board[newRow][newCol] === -1
            ) {
                minesCount++;
            }
        });

        return minesCount;
    }
}
