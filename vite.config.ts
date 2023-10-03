import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const BASE_URL = process.env.APP_ENV === "local" ? "" : process.env.GH_PAGE_BASE;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: [
            { find: "@", replacement: path.resolve(__dirname, "src") },
            { find: "@util", replacement: path.resolve(__dirname, "src/util") },
            { find: "@type", replacement: path.resolve(__dirname, "src/type") },
            { find: "@hooks", replacement: path.resolve(__dirname, "src/hooks") },
            { find: "@components", replacement: path.resolve(__dirname, "src/components") },
            { find: "@routes", replacement: path.resolve(__dirname, "src/routes") },
            { find: "@atoms", replacement: path.resolve(__dirname, "src/atoms") },
            { find: "@workarounds", replacement: path.resolve(__dirname, "src/workarounds") },
            {
                find: "tailwind-config",
                replacement: path.resolve(__dirname, "./tailwind.config.js"),
            },
        ],
    },
    base: BASE_URL,
});
