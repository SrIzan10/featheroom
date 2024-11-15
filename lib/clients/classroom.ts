/* eslint-disable no-throw-literal */
import { type classroom_v1 } from '@googleapis/classroom'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { QueryClient, useQuery } from '@tanstack/react-query'

import { AnnouncementUserProfile } from '../types/Classroom'

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

// Should fix annoying (in my experience the announcement hook) missing errors.
let tokenPromise: Promise<string> | null = null
async function getAuthToken(): Promise<string> {
  if (!tokenPromise) {
    tokenPromise = GoogleSignin.getTokens()
      .then((tokens) => tokens.accessToken)
      .finally(() => {
        tokenPromise = null
      })
  }
  return tokenPromise
}

async function fetchUserProfile(userId: string) {
  const response = await fetch(
    `https://classroom.googleapis.com/v1/userProfiles/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    },
  )

  if (!response.ok) {
    console.log('Error fetching user profile:', response.status)
    return null
  }

  return await response.json()
}

async function fetchApi<T>(
  endpoint: string,
  insideKey?: string,
  options?: RequestInit,
): Promise<T> {
  const token = await getAuthToken()
  //console.log('token', token)
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    console.log('Error:', response.statusText)
    throw { message: response.statusText, status: response.status } as ApiError
  }

  const data = await response.json()
  const key = insideKey ? (data[insideKey] ?? []) : data

  // check if the key has a creatorUserId, if so, fetch the user profile
  if (Array.isArray(key)) {
    const enrichedKey = await Promise.all(
      key.map(async (item) => {
        if (item.creatorUserId) {
          const profile = await fetchUserProfile(item.creatorUserId)
          return {
            ...item,
            creator: profile,
          }
        }
        return item
      }),
    )
    return enrichedKey as T
  }

  return key
}

// Query Keys
export const keys = {
  courses: {
    all: ['courses'],
    one: (id: string) => ['courses', id],
    announcements: (courseId: string) => ['courses', courseId, 'announcements'],
    courseWork: (courseId: string) => ['courses', courseId, 'courseWork'],
    courseWorkMaterials: (courseId: string) => [
      'courses',
      courseId,
      'courseWorkMaterials',
    ],
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

export function useAnnouncements(courseId: string) {
  return useQuery({
    queryKey: keys.courses.announcements(courseId),
    queryFn: () =>
      fetchApi<AnnouncementUserProfile[]>(
        `/v1/courses/${courseId}/announcements`,
        'announcements',
      ),
  })
}

export function useCourseWork(courseId: string) {
  return useQuery({
    queryKey: keys.courses.courseWork(courseId),
    queryFn: () =>
      fetchApi<classroom_v1.Schema$CourseWork[]>(
        `/v1/courses/${courseId}/courseWork`,
        'courseWork',
      ),
  })
}

export function useCourseWorkMaterials(courseId: string) {
  return useQuery({
    queryKey: keys.courses.courseWorkMaterials(courseId),
    queryFn: () =>
      fetchApi<classroom_v1.Schema$CourseWorkMaterial[]>(
        `/v1/courses/${courseId}/courseWorkMaterials`,
        'courseWorkMaterial',
      ),
  })
}

// various api utils from now on
export function classroomDateTimeToISO(
  date: classroom_v1.Schema$Date,
  time?: classroom_v1.Schema$TimeOfDay,
) {
  if (!time) {
    time = { hours: 23, minutes: 59 }
  }
  const dt = new Date(
    date.year!,
    date.month! - 1,
    date.day!,
    time.hours!,
    time.minutes!,
  ).toISOString()
  return dt
}
