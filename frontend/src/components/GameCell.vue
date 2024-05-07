<script lang="ts" setup>
import { computed } from "vue"
import { useCurrentUser } from "../composables/useCurrentUser"

const props = defineProps<{
    row: number
    col: number
    moves: {
        userId: string
        row: number
        col: number
        result: number
        timestamp: string
    }[]
}>()

defineEmits<{
    (e: "click"): void
}>()

const move = computed(() => props.moves.find((el) => el.row === props.row && el.col === props.col))

const currentUser = useCurrentUser()
</script>

<template>
    <div
        class="flex items-center justify-center flex-1 aspect-square rounded text-3xl font-bold select-none"
        :class="{
            'text-slate-600': move && move.result >= 0,
            'text-lime-400': move && move.result < 0 && move.userId === currentUser.id,
            'text-red-400': move && move.result < 0 && move.userId !== currentUser.id,
            'pointer-events-none': move !== undefined,
            'cursor-pointer bg-slate-700 hover:bg-slate-600': move === undefined,
        }"
        @click="$emit('click')"
    >
        {{ move?.result === -1 ? "+1" : move?.result }}
    </div>
</template>
