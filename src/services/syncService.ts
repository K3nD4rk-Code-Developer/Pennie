import { plaidService } from "./plaidService";

export const syncService = {
  async syncAllAccounts(accounts: any[], setTransactions: any) {
    for (const account of accounts.filter(a => a.connected && a.accessToken)) {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const data = await plaidService.fetchTransactions(
          account.accessToken,
          startDate,
          endDate
        );
        
        // Process and add new transactions
        // Update account balances
      } catch (error) {
        console.error(`Sync failed for ${account.name}:`, error);
      }
    }
  }
};