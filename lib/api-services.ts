import { apiClient, serverApiClient, type ApiResponse } from './api-client'

// Example service for users
export class UserService {
  // Client-side methods
  static async getUsers(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/users')
  }

  static async getUserById(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/users/${id}`)
  }

  static async createUser(userData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/users', userData)
  }

  static async updateUser(id: string, userData: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/users/${id}`, userData)
  }

  static async deleteUser(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/users/${id}`)
  }

  // Server-side methods (for Server Components and Server Actions)
  static async getUsersServer(): Promise<ApiResponse<any[]>> {
    return serverApiClient.get('/users')
  }

  static async getUserByIdServer(id: string): Promise<ApiResponse<any>> {
    return serverApiClient.get(`/users/${id}`)
  }
}

// Example service for posts
export class PostService {
  static async getPosts(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/posts')
  }

  static async getPostById(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/posts/${id}`)
  }

  static async createPost(postData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/posts', postData)
  }

  static async updatePost(id: string, postData: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/posts/${id}`, postData)
  }

  static async deletePost(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/posts/${id}`)
  }

  // Server-side methods
  static async getPostsServer(): Promise<ApiResponse<any[]>> {
    return serverApiClient.get('/posts')
  }
}
