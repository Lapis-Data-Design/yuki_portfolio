import { config } from "dotenv";

type LoadOptions = {
    allowTestBranch?: boolean;
};

export function loadScriptEnv({ allowTestBranch = false }: LoadOptions = {}) {
    const envFile = process.env.ENV_FILE ?? ".env.local";
    const result = config({path: envFile });

    if ( result.error ) {
        throw new Error(`Could not read ${envFile}: ${result.error.message}`);
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error(`DATABASE_URL is not set in ${envFile}.`);
    }

    if (!allowTestBranch && process.env.NEON_BRANCH === "test") {
        throw new Error("This script refuses to run against the Neon test branch.");
    }

    const host = databaseHost(databaseUrl, envFile);
    console.log(`Target: ${host} (from ${envFile})\n`);
    return { envFile, host };
}

function databaseHost(databaseUrl: string, envFile: string) {
    try{
        return new URL(databaseUrl).host;
    } catch {
        throw new Error(`DATABASE_URL in ${envFile} is not a valid URL.`);
    }
}

export function runScript(main: () => Promise<void>) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}