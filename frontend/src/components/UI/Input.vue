<script lang="ts" setup>
import { ClassValue } from "clsx"
import { cn } from "../../utils"

const model = defineModel()

defineProps<{ class?: ClassValue }>()
</script>

<template>
    <input
        :class="cn('bg-transparent border border-white/15 rounded h-10 px-4 outline-none', $props.class)"
        v-model="model"
    />
</template>
