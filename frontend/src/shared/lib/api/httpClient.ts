import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class HttpClient {
  private client: any;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: any) => {
        // Add auth token if available
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => {
        // Log response time in development
        if (import.meta.env.DEV) {
          const endTime = new Date();
          const startTime = response.config.metadata?.startTime;
          if (startTime) {
            const duration = endTime.getTime() - startTime.getTime();
            console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
          }
        }

        return response;
      },
      (error: any) => {
        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          window.location.href = '/login';
        }

        // Log error in development
        if (import.meta.env.DEV) {
          console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private getStoredToken(): string | null {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.error('Error getting stored token:', error);
    }
    return null;
  }

  private clearToken(): void {
    try {
      localStorage.removeItem('auth-storage');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // HTTP Methods
  async get(url: string, config?: any): Promise<any> {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: any): Promise<any> {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: any, config?: any): Promise<any> {
    return this.client.put(url, data, config);
  }

  async patch(url: string, data?: any, config?: any): Promise<any> {
    return this.client.patch(url, data, config);
  }

  async delete(url: string, config?: any): Promise<any> {
    return this.client.delete(url, config);
  }

  // Upload file with progress
  async upload(
    url: string, 
    file: File, 
    onProgress?: (progressEvent: any) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  }
}

export const httpClient = new HttpClient();