<script lang="ts" setup>
import { useCurrentUser } from "../composables/useCurrentUser"
import Input from "../components/UI/Input.vue"
import Button from "../components/UI/Button.vue"
import { ref } from "vue"
import { GamesAPI } from "../api/games.api"
import { useQuery } from "@tanstack/vue-query"
import GameItem from "../components/GameItem.vue"
import { useRouter } from "vue-router"

const router = useRouter()
const size = ref<number>()
const mines = ref<number>()
const currentUser = useCurrentUser()

const onCreate = () => {
    if (!size.value || !mines.value) {
        return
    }

    GamesAPI.create({ size: size.value, mines: mines.value }).then(({ id }) => {
        router.push(`/games/${id}`)
    })
}

const onJoin = (gameId: string) => {
    GamesAPI.join({ gameId }).then(() => {
        router.push(`/games/${gameId}`)
    })
}

const { data } = useQuery({
    queryKey: ["games"],
    queryFn: () => GamesAPI.getAvailable(),
    initialData: {
        games: [],
    },
    // TODO: Получать новые игры через вебсокет чтобы избавиться от лишних запросов
    refetchInterval: 2000,
})
</script>

<template>
    <div class="mx-auto max-w-4xl w-full px-2">
        <h1 class="mb-10 text-center text-4xl">Добро пожаловать в игру, {{ currentUser.name }}!</h1>
        <div class="grid grid-cols-[2fr_1fr] gap-10">
            <div>
                <h3 class="text-2xl mb-4">Список игр</h3>
                <template v-if="data">
                    <div v-if="data.games.length === 0">Игр не найдено</div>
                    <div v-else class="space-y-4">
                        <GameItem
                            v-for="game in data.games"
                            :key="game._id"
                            :game="game"
                            @join="() => onJoin(game._id)"
                            @open="() => router.push(`/games/${game._id}`)"
                        />
                    </div>
                </template>
            </div>
            <div class="bg-slate-800 rounded p-6">
                <h3 class="text-2xl mb-6 leading-none">Создать новую игру</h3>
                <form @submit.prevent="onCreate" class="flex flex-col gap-6">
                    <Input type="number" placeholder="Размер поля" min="5" max="15" v-model="size" />
                    <Input type="number" placeholder="Количество бомб" min="1" max="25" v-model="mines" />
                    <Button type="submit">Создать</Button>
                </form>
            </div>
        </div>
    </div>
</template>
