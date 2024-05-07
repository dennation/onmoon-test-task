import { useLocalStorage } from "@vueuse/core"
import { JWT_LOCAL_STORAGE_KEY } from "../constants"
import { computed } from "vue"
import type { User } from "../types"
import { decodeJWTPayload } from "../utils"

export function useCurrentUser() {
    const token = useLocalStorage<string>(JWT_LOCAL_STORAGE_KEY, null)

    const user = computed(() => {
        if (!token.value) {
            throw new Error("Unauthorized")
        }
        return decodeJWTPayload<User>(token.value)
    })

    return user
}
