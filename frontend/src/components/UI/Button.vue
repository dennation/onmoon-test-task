<script lang="ts" setup>
import { ClassValue } from "clsx"
import { cn } from "../../utils"

type Color = "default" | "primary"

const colorClasses: Record<Color, string> = {
    default: "bg-slate-600 text-slate-300 hover:bg-slate-500",
    primary: "bg-lime-600 text-white",
}

const props = withDefaults(
    defineProps<{
        color?: Color
        class?: ClassValue
    }>(),
    {
        color: "default",
    }
)
</script>

<template>
    <button :class="cn('h-10 rounded px-4', colorClasses[props.color], props.class)">
        <slot></slot>
    </button>
</template>
