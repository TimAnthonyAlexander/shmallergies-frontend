const API_BASE_URL = import.meta.env.DEV 
  ? 'http://shmallergies.test:2811/api'
  : 'https://api.shmallergies.de/api';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw errorData;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async signup(data: { name: string; email: string; password: string; password_confirmation: string }) {
    return this.request<{ message: string; user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ message: string; user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async resendVerificationEmail(data: { email: string }) {
    return this.request<{ message: string }>('/auth/email/resend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request<{ message: string; user: any }>('/user');
  }

  async getUserAllergies() {
    return this.request<{ message: string; allergies: any[] }>('/user/allergies');
  }

  async addUserAllergy(data: { allergy_text: string }) {
    return this.request<{ message: string; allergy: any }>('/user/allergies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserAllergy(id: number, data: { allergy_text: string }) {
    return this.request<{ message: string; allergy: any }>(`/user/allergies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUserAllergy(id: number) {
    return this.request<{ message: string }>(`/user/allergies/${id}`, {
      method: 'DELETE',
    });
  }

  async checkProductSafety(productId: number) {
    return this.request<{
      message: string;
      product: any;
      is_safe: boolean;
      potential_conflicts: string[];
      product_allergens: string[];
    }>(`/user/product-safety/${productId}`);
  }

  // Product endpoints
  async getProducts(page: number = 1, perPage: number = 15) {
    return this.request<{
      message: string;
      data: any[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    }>(`/products?page=${page}&per_page=${perPage}`);
  }

  async searchProducts(query: string, limit: number = 10) {
    return this.request<{
      message: string;
      products: any[];
      total: number;
    }>(`/products/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getProduct(id: number) {
    return this.request<{
      message: string;
      product: any;
    }>(`/products/${id}`);
  }

  async getProductByUpc(upcCode: string) {
    return this.request<{
      message: string;
      product: any;
    }>(`/products/upc/${upcCode}`);
  }

  async getProductsByAllergens(allergens: string[], limit: number = 10) {
    return this.request<{
      message: string;
      products: any[];
      total: number;
      searched_allergens: string[];
    }>(`/products/allergens?allergens=${allergens.join(',')}&limit=${limit}`);
  }

  async createProduct(formData: FormData) {
    // Handle FormData separately to avoid Content-Type header conflicts
    const url = `${this.baseUrl}/products`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw errorData;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async ping() {
    return this.request<{ message: string; timestamp: string }>('/ping');
  }
}

export const apiClient = new ApiClient(); 