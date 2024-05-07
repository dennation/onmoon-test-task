import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import mkcert from "vite-plugin-mkcert"

// https://vitejs.dev/config/
export default () => {
    return defineConfig({
        server: { https: true },
        preview: {
            port: 3001,
        },
        plugins: [mkcert(), vue()],
    })
}
