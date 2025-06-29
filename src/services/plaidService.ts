// src/services/plaidService.ts
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}`
  : 'https://localhost:5000';

class PlaidService {
  private async apiCall(endpoint: string, body: any) {
    try {
      console.log(`🔗 Calling API: ${API_BASE_URL}/api/plaid/${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}/api/plaid/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || 'API request failed';
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ API Success:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Network Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Make sure your backend is running.');
      }
      
      throw error;
    }
  }

  async createLinkToken(): Promise<{ link_token: string }> {
    return await this.apiCall('create-link-token', {});
  }

  async exchangePublicToken(publicToken: string): Promise<{ access_token: string; item_id: string }> {
    return await this.apiCall('exchange-token', { public_token: publicToken });
  }

  async fetchAccounts(accessToken: string): Promise<{ accounts: any[] }> {
    return await this.apiCall('accounts', { access_token: accessToken });
  }

  async fetchTransactions(
    accessToken: string, 
    startDate: string, 
    endDate: string, 
    accountIds?: string[]
  ): Promise<{ transactions: any[] }> {
    return await this.apiCall('transactions', {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      account_ids: accountIds,
    });
  }
}

export const plaidService = new PlaidService();