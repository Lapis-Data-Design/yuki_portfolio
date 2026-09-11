import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
        },
    },
    test: {
        environment: "node",
        globals: true,
        include: ["tests/integration/**/*.test.ts"],
        setupFiles: ["./tests/integration/setup.ts"],
        testTimeout: 15000,
    },
});