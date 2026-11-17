import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inspect } from "node:util";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { loadScriptEnv } from "./script-env";

const PASSWORD = "s3cret-pw";
let emptyEnvFile: string;

beforeAll(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "script-env-"));
    emptyEnvFile = path.join(dir, ".env.empty");
    fs.writeFileSync(emptyEnvFile, "");
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe("loadScriptEnv", () => {
    it("returns the host of a valid DATABASE_URL without printing the password", () => {
        const log = vi.spyOn(console, "log").mockImplementation(() => {});
        vi.stubEnv("ENV_FILE", emptyEnvFile);
        vi.stubEnv("DATABASE_URL", `postgresql://user:${PASSWORD}@db.example.test/neondb`);

        const { host } = loadScriptEnv({ allowTestBranch: true });

        expect(host).toBe("db.example.test");
        expect(inspect(log.mock.calls)).not.toContain(PASSWORD);
    });

    it("throws a generic error for an invalid DATABASE_URL, without the connection string", () => {
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.stubEnv("ENV_FILE", emptyEnvFile);
        vi.stubEnv("DATABASE_URL", `postbresql://user:${PASSWORD}@bad host/neondb`);

        let caught: unknown;
        try {
            loadScriptEnv({ allowTestBranch: true });
        } catch (error) {
            caught = error;
        }

        expect(caught).toBeInstanceOf(Error);
        expect((caught as Error).message).toBe(`DATABASE_URL in ${emptyEnvFile} is not a valid URL.`);

        expect(inspect(caught)).not.toContain(PASSWORD);
    });
});