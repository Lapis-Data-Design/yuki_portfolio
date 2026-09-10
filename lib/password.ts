import { randomBytes } from "crypto";
import { hash, compare } from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
    return hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
    password: string,
    passwordHash: string
): Promise<boolean> {
    return compare(password, passwordHash);
}

export function generateTemporaryPassword(): string {
    return randomBytes(12).toString("base64url");
};