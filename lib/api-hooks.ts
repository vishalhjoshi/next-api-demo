'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, type ApiResponse } from './api-client'

// Custom hook for API calls with loading states
export function useApi<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (
    apiCall: () => Promise<ApiResponse<T>>
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiCall()
      
      if (response.error) {
        setError(response.error)
        setData(null)
      } else {
        setData(response.data || null)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}

// Hook for GET requests with automatic fetching
export function useFetch<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.get<T>(endpoint)
    
    if (response.error) {
      setError(response.error)
      setData(null)
    } else {
      setData(response.data || null)
      setError(null)
    }
    
    setLoading(false)
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Hook for mutations (POST, PUT, DELETE, etc.)
export function useMutation<T, P = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (
    apiCall: (params: P) => Promise<ApiResponse<T>>
  ) => {
    return new Promise<ApiResponse<T>>((resolve) => {
      setLoading(true)
      setError(null)
      
      apiCall({} as P)
        .then((response) => {
          if (response.error) {
            setError(response.error)
          }
          resolve(response)
        })
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          setError(errorMessage)
          resolve({
            data: null,
            error: errorMessage,
            status: 0,
          })
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }, [])

  return { mutate, loading, error }
}
