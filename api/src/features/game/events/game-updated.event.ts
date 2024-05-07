import type { GameState } from 'src/features/game/game-state.enum';

export class GameUpdatedEvent {
    id: string;
    state?: GameState;
    players?: {
        id: string;
        name: string;
        score: number;
    }[];
}
