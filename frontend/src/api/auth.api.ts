import { http } from "../http"

type LoginParams = {
    name: string
}
type LoginResponse = {
    token: string
}

const login = ({ name }: LoginParams) => http.post("auth/login", { json: { name } }).json<LoginResponse>()

export const AuthAPI = {
    login,
}
