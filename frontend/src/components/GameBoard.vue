<script lang="ts" setup>
import GameCell from "./GameCell.vue"

defineProps<{
    disabled?: boolean
    size: number
    moves: {
        userId: string
        row: number
        col: number
        result: number
        timestamp: string
    }[]
}>()

defineEmits<{
    (e: "open", row: number, col: number): void
}>()
</script>

<template>
    <div class="relative">
        <div
            class="flex flex-col gap-2 bg-slate-800 rounded-md p-2"
            :class="{ 'pointer-events-none': disabled }"
        >
            <div v-for="row in size" :key="row" class="flex gap-2">
                <GameCell
                    v-for="col in size"
                    :key="col"
                    :moves="moves"
                    :row="row - 1"
                    :col="col - 1"
                    @click="() => $emit('open', row - 1, col - 1)"
                />
            </div>
        </div>
    </div>
</template>
