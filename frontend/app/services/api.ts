// API client service for backend communication
import { API_BASE_URL } from '../environment/environment';

const BACKEND_URL = API_BASE_URL;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  stockId: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  transactionTime: string;
}

export interface PortfolioItem {
  stock: Stock;
  netQuantity: number;
  avgBuyPrice: number;
  currentValue: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
}

export interface CreateStockRequest {
  symbol: string;
  name: string;
}

export interface CreateTransactionRequest {
  userId: string;
  stockId: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
  };
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Health checks
  async healthCheck() {
    return this.request('/health');
  }

  async readinessCheck() {
    return this.request('/ready');
  }

  async livenessCheck() {
    return this.request('/live');
  }

  // Authentication
  async signUp(data: SignUpRequest) {
    return this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: SignInRequest) {
    return this.request<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signOut() {
    return this.request('/api/auth/signout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async getProfile() {
    return this.request<{ id: string; email: string }>('/api/auth/profile');
  }

  // Users
  async createUser(data: CreateUserRequest) {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUser(id: string) {
    return this.request<User>(`/api/users/${id}`);
  }

  async getUserTransactions(userId: string, limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<{ transactions: Transaction[]; count: number }>(
      `/api/user/${userId}/transactions?${params.toString()}`
    );
  }

  async getUserPortfolio(userId: string) {
    return this.request<{ portfolio: PortfolioItem[]; count: number }>(
      `/api/user/${userId}/portfolio`
    );
  }

  // Stocks
  async getStocks(limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<{ stocks: Stock[]; count: number }>(
      `/api/stocks?${params.toString()}`
    );
  }

  async getStock(id: string) {
    return this.request<Stock>(`/api/stocks/${id}`);
  }

  async getStockBySymbol(symbol: string) {
    return this.request<Stock>(`/api/stocks/symbol/${symbol}`);
  }

  async createStock(data: CreateStockRequest) {
    return this.request<Stock>('/api/stock', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStock(id: string, data: Partial<CreateStockRequest>) {
    return this.request<Stock>(`/api/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStock(id: string) {
    return this.request<{ message: string }>(`/api/stock/${id}`, {
      method: 'DELETE',
    });
  }

  async getStockTransactions(stockId: string, limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<{ transactions: Transaction[]; count: number }>(
      `/api/stock/${stockId}/transactions?${params.toString()}`
    );
  }

  // Transactions
  async createTransaction(data: CreateTransactionRequest) {
    return this.request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransaction(id: string) {
    return this.request<Transaction>(`/api/transactions/${id}`);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing
export { ApiClient };
