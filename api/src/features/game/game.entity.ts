import { GameState } from 'src/features/game/game-state.enum';
import {
    Entity,
    ObjectIdColumn,
    Column,
    ObjectId,
    CreateDateColumn,
} from 'typeorm';

@Entity()
export class Game {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    createdBy: string;

    @Column()
    players: {
        id: string;
        name: string;
        score: number;
    }[];

    @Column()
    size: number;

    @Column()
    mines: number;

    @Column('simple-array')
    gameBoard: number[][];

    @Column()
    moves: {
        userId: string;
        row: number;
        col: number;
        result: number;
        timestamp: Date;
    }[];

    @Column({
        type: 'enum',
        enum: GameState,
        default: GameState.Created,
    })
    state: GameState;

    @CreateDateColumn()
    createdAt: Date;
}
