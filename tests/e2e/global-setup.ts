import { seedTestAccounts } from './fixtures/accounts';

export default async function globalSetup() { 
    await seedTestAccounts();
}