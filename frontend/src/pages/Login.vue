<script lang="ts" setup>
import { ref } from "vue"
import { AuthAPI } from "../api/auth.api"
import { JWT_LOCAL_STORAGE_KEY } from "../constants"
import { useRouter } from "vue-router"
import Input from "../components/UI/Input.vue"
import Button from "../components/UI/Button.vue"

const name = ref("")
const router = useRouter()

const onSubmit = () => {
    AuthAPI.login({ name: name.value }).then(({ token }) => {
        localStorage.setItem(JWT_LOCAL_STORAGE_KEY, token)
        router.push("/")
    })
}
</script>

<template>
    <div class="mx-auto max-w-3xl w-full px-2">
        <h1 class="mb-10 text-center text-4xl">Добро пожаловать в игру!</h1>
        <form class="flex justify-center gap-4" @submit.prevent="onSubmit">
            <div>
                <Input type="text" minlength="3" required v-model="name" placeholder="Ввведите ваше имя" />
            </div>
            <div>
                <Button type="submit" color="primary">Присоединиться</Button>
            </div>
        </form>
    </div>
</template>
