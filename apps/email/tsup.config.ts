import { defineConfig } from "tsup"

const isProduction = process.env.ENVIRONMENT === "production"

export default defineConfig({
    clean: true,
    dts: false,
    entry: ["src/main.ts"],
    format: ["esm"],
    minify: isProduction,
    sourcemap: true,
})
