import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const ACCOUNTS = [
    { email: "elysabward@gmail.com", role: "admin" as const },
    { email: "yukimdono@gmail.com", role: "owner" as const },
];

async function seed() {
    const { db } = await import("../db/client");
    const { users } = await import("../db/schema");
    const { hashPassword, generateTemporaryPassword } = await import("@/lib/auth");

    for (const account of ACCOUNTS) {
        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, account.email))
            .limit(1);

        if (existing) {
            console.log(`Skipped ${account.email} - already exists.`);
            continue;
        }

        const tempPassword = generateTemporaryPassword();
        const passwordHash = await hashPassword(tempPassword);

        await db.insert(users).values({
            email: account.email,
            passwordHash,
            role: account.role,
            mustChangePassword: true,
        });

        console.log(`Created ${account.role}: ${account.email}`);
        console.log(`   Temporary password: ${tempPassword}`);
    }

    console.log("\nDone. Share each temporary password securely, then clear this terminal output.");
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    })