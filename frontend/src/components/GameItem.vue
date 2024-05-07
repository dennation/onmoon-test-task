<script lang="ts" setup>
import { computed } from "vue"
import { Player } from "./../types.ts"
import Button from "./UI/Button.vue"
import { GameState } from "../constants"
import { useCurrentUser } from "../composables/useCurrentUser"

defineEmits<{
    (e: "join"): void
    (e: "open"): void
}>()

const currentUser = useCurrentUser()

const props = defineProps<{
    game: {
        _id: string
        createdBy: string
        players: Player[]
        size: number
        mines: number
        state: GameState
    }
}>()

const creator = computed(() => {
    const player = props.game.players.find((player) => player.id === props.game.createdBy)

    if (!player) {
        throw new Error("Cannot find player")
    }

    return player
})
</script>

<template>
    <div
        class="rounded px-4 py-3 flex items-center gap-4"
        :class="{
            'bg-slate-700 animate-pulse': game.state === GameState.Started || game.createdBy === currentUser.id,
            'bg-slate-800': game.state === GameState.Created && game.createdBy !== currentUser.id,
        }"
    >
        <div class="flex-1">{{ creator.name }}</div>
        <div>
            Поле: <strong>{{ game.size }} x {{ game.size }}</strong>
        </div>
        <div>
            Мины: <strong>{{ game.mines }}</strong>
        </div>
        <Button
            v-if="game.state === GameState.Created && game.createdBy !== currentUser.id"
            color="primary"
            @click="$emit('join')"
            >Присоединиться</Button
        >
        <Button
            v-if="game.state === GameState.Started || game.createdBy === currentUser.id"
            @click="$emit('open')"
            >Открыть</Button
        >
    </div>
</template>
