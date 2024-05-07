<script lang="ts" setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query"
import GameBoard from "../components/GameBoard.vue"
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { GamesAPI } from "../api/games.api"
import io, { Socket } from "socket.io-client"
import { useLocalStorage } from "@vueuse/core"
import { JWT_LOCAL_STORAGE_KEY } from "../constants"
import { useCurrentUser } from "../composables/useCurrentUser"
import { GameState } from "../constants"

const route = useRoute()
const gameId = computed(() => route.params.gameId as string)
const token = useLocalStorage<string>(JWT_LOCAL_STORAGE_KEY, null)
const queryClient = useQueryClient()

const socket = ref<Socket | null>(null)

const currentUser = useCurrentUser()

const { data, isError, isPending } = useQuery({
    queryKey: ["games", { gameId }],
    queryFn: () => GamesAPI.single({ gameId: gameId.value }),
})

const onOpen = (row: number, col: number) => {
    socket.value?.emit("openCell", { row, col, gameId: gameId.value })
}

const nextMove = computed(() => {
    if (!data.value) {
        return undefined
    }

    const lastMove = data.value.moves[data.value.moves.length - 1]

    if (lastMove) {
        return lastMove.result < 0
            ? lastMove.userId
            : data.value.players.find((p) => p.id !== lastMove.userId)?.id
    }

    return data.value.createdBy
})

const foundMines = computed(() => data.value?.moves?.filter((move) => move.result === -1).length ?? 0)
const winner = computed(() => data.value?.players.sort((a, b) => a.score - b.score).pop())

watch(
    token,
    () => {
        if (token.value) {
            socket.value = io(`${import.meta.env.VITE_API_URL}/games`, {
                query: {
                    token: token.value,
                },
            })

            socket.value.on("connect", () => {
                console.log("Connected to server")
                socket.value?.emit("joinGameRoom", { gameId: gameId.value })
            })

            socket.value.on("connect_error", (err) => {
                console.error("Connection failed:", err)
            })

            socket.value.on("updateGame", (update) => {
                queryClient.setQueryData(["games", { gameId }], { ...data.value, ...update })
            })
        }
    },
    { immediate: true }
)
</script>

<template>
    <div class="mx-auto max-w-3xl w-full px-2">
        <div v-if="isError || isPending"></div>
        <div v-if="data">
            <div class="text-center text-4xl font-light mb-10">
                <template v-if="data.state === GameState.Created">Ожидание второго игрока...</template>
                <template v-else-if="data.state === GameState.Started">
                    <template v-if="currentUser.id === nextMove">Ваш ход</template>
                    <template v-else>Ход соперника</template>
                </template>
                <template v-if="data.state === GameState.Finished"
                    >Игра завершена. Победитель - {{ winner?.name }}</template
                >
            </div>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div
                    v-for="player in data.players"
                    :key="player.id"
                    class="rounded text-white p-4 flex justify-between items-center transition-colors"
                    :class="{
                        'border border-slate-200': player.id !== nextMove,
                        'bg-slate-200 text-slate-800': player.id === nextMove,
                    }"
                >
                    <div class="text-2xl">{{ player.name }}</div>
                    <div>
                        <span class="text-base">Score:</span>
                        <span class="font-bold text-4xl pl-1 leading-none">{{ player.score }}</span>
                    </div>
                </div>
            </div>

            <GameBoard
                class="mb-10"
                :next-move="nextMove"
                :disabled="data.state !== GameState.Started || nextMove !== currentUser.id"
                :size="data.size"
                :moves="data.moves"
                @open="onOpen"
            />

            <div class="text-center text-4xl font-light text-slate-300">
                {{ foundMines }} из {{ data.mines }} найдено
            </div>
        </div>
    </div>
</template>
