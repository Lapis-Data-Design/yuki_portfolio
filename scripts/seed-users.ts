import { db } from "../db/client";
import { users } from "../db/schema";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

const ACCOUNTS = [
    { email: "elysabward@gmail.com", role: "admin" as const },
    { email: "yukimdono@gmail.com", role: "owner" as const },
];

async function seed() {
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