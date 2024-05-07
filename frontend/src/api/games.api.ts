import { GameState } from "../constants"
import { http } from "../http"
import { Player } from "../types"

type CreateParams = {
    size: number
    mines: number
}

type CreateResponse = {
    id: string
}

const create = (params: CreateParams) => http.post("games", { json: params }).json<CreateResponse>()

type GetAvailableResponse = {
    games: {
        _id: string
        createdBy: string
        size: number
        mines: number
        state: GameState
        createdAt: string
        players: {
            id: string
            name: string
            score: number
        }[]
    }[]
}

const getAvailable = () => http.get("games").json<GetAvailableResponse>()

type JoinParams = {
    gameId: string
}

const join = (params: JoinParams) => http.post(`games/${params.gameId}/join`).json()

type SingleParams = {
    gameId: string
}

type SingleResponse = {
    _id: string
    createdBy: string
    mines: number
    moves: {
        userId: string
        row: number
        col: number
        result: number
        timestamp: string
    }[]
    players: Player[]
    size: number
    state: GameState
}

const single = (params: SingleParams) => http.get(`games/${params.gameId}`).json<SingleResponse>()

export const GamesAPI = {
    create,
    getAvailable,
    join,
    single,
}
