import { cleanupTestAccounts } from "./fixtures/accounts";

export default async function globalTeardown() {
   cleanupTestAccounts();
}