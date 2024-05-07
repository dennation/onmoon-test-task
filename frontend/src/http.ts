import ky from "ky"
import { JWT_LOCAL_STORAGE_KEY } from "./constants"

export const http = ky.extend({
    prefixUrl: import.meta.env.VITE_API_URL,
    hooks: {
        beforeRequest: [
            (request) => {
                const token = localStorage.getItem(JWT_LOCAL_STORAGE_KEY)

                if (token) {
                    request.headers.set("Authorization", `Bearer ${token}`)
                }
            },
        ],
    },
})
