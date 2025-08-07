const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

// Types for better TypeScript support
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface ApiOptions extends RequestInit {
  timeout?: number
}

// Enhanced fetch wrapper with error handling and timeout
async function fetchWithTimeout(
  url: string, 
  options: ApiOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Main API client class
export class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Set authorization token
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`,
    }
  }

  // Remove authorization token
  clearAuthToken() {
    const { Authorization, ...headers } = this.defaultHeaders as any
    this.defaultHeaders = headers
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: ApiOptions = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetchWithTimeout(url, config)
      
      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        return {
          data: null,
          error: data.message || data.error || `HTTP ${response.status}`,
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            data: null,
            error: 'Request timeout',
            status: 408,
          }
        }
        return {
          data: null,
          error: error.message,
          status: 0,
        }
      }
      return {
        data: null,
        error: 'Unknown error occurred',
        status: 0,
      }
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(
    endpoint: string, 
    data?: any, 
    options?: ApiOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string, 
    data?: any, 
    options?: ApiOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(
    endpoint: string, 
    data?: any, 
    options?: ApiOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // File upload method
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: Omit<ApiOptions, 'body'>
  ): Promise<ApiResponse<T>> {
    const { 'Content-Type': _, ...headersWithoutContentType } = this.defaultHeaders as any
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        ...headersWithoutContentType,
        ...options?.headers,
      },
      body: formData,
    })
  }
}

// Create singleton instances
export const apiClient = new ApiClient()

// Server-side API client (for use in Server Components and Server Actions)
export const serverApiClient = new ApiClient()
