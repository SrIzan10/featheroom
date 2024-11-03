/* eslint-disable no-throw-literal */
import { type classroom_v1 } from '@googleapis/classroom'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { QueryClient, useQuery } from '@tanstack/react-query'

type ApiError = {
  message: string
  status: number
}

// Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

// API Functions
const BASE_URL = 'https://classroom.googleapis.com'

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = (await GoogleSignin.getTokens()).accessToken
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw { message: response.statusText, status: response.status } as ApiError
  }

  return response.json()
}

// Query Keys
export const keys = {
  courses: {
    all: ['courses'],
    one: (id: string) => ['courses', id],
  },
}

// Hooks
export function useCourses() {
  return useQuery({
    queryKey: keys.courses.all,
    queryFn: () =>
      fetchApi<{ courses: classroom_v1.Schema$Course[] }>('/v1/courses'),
  })
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: keys.courses.one(id),
    queryFn: () => fetchApi<classroom_v1.Schema$Course>(`/v1/courses/${id}`),
  })
}
