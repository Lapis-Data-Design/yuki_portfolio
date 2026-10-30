import { eq } from "drizzle-orm";
import { loadScriptEnv, runScript } from "./_lib/script-env";
import { normalizeEmail } from "@/lib/email";

const ACCOUNTS = [
    { email: "elysabward@gmail.com", role: "admin" as const },
    { email: "yukimdono@gmail.com", role: "owner" as const },
];

async function seedUsers() {
    loadScriptEnv();

    const { db } = await import("../db/client");
    const { users } = await import("../db/schema");
    const { hashPassword, generateTemporaryPassword } = await import("@/lib/password");

    for (const account of ACCOUNTS) {
        const email = normalizeEmail(account.email);

        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existing) {
            console.log(`Skipped ${email} - already exists.`);
            continue;
        }

        const tempPassword = generateTemporaryPassword();
        const passwordHash = await hashPassword(tempPassword);

        await db.insert(users).values({
            email: email,
            passwordHash,
            role: account.role,
            mustChangePassword: true,
        });

        console.log(`Created ${account.role}: ${email}`);
        console.log(`   Temporary password: ${tempPassword}`);
    }

    console.log("\nDone. Share each temporary password securely, then clear this terminal output.");
}

runScript(seedUsers);