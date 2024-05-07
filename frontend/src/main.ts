import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import Home from "./pages/Home.vue"
import Login from "./pages/Login.vue"
import { VueQueryPlugin } from "@tanstack/vue-query"
import { JWT_LOCAL_STORAGE_KEY } from "./constants"
import Game from "./pages/Game.vue"

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: Home,
    },
    {
        path: "/login",
        component: Login,
        meta: {
            isPublic: true,
        },
    },
    {
        path: "/games/:gameId",
        component: Game,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _, next) => {
    if (to.meta.isPublic || localStorage.getItem(JWT_LOCAL_STORAGE_KEY)) {
        next()
        return
    }

    next("/login")
})

createApp(App).use(router).use(VueQueryPlugin).mount("#app")
