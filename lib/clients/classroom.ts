/* eslint-disable no-throw-literal */
import { type classroom_v1 } from '@googleapis/classroom'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'

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
  // this is getting out of control quickly
  const key = insideKey ? (data[insideKey] ?? []) : data
  const creatorProfileData = await enrichWithCreatorProfile<T>(key)

  return creatorProfileData || key
}

// Query Keys
export const keys = {
  courses: {
    all: ['courses'],
    one: (id: string) => ['courses', id],
    announcements: (courseId: string) => ['courses', courseId, 'announcements'],
    courseWorks: (courseId: string) => ['courses', courseId, 'courseWork'],
    courseWork: (courseId: string, courseWorkId: string) => [
      'courses',
      courseId,
      'courseWork',
      courseWorkId,
    ],
    courseWorkMaterials: (courseId: string) => [
      'courses',
      courseId,
      'courseWorkMaterials',
    ],
    courseWorkMaterial: (courseId: string, courseWorkMaterialId: string) => [
      'courses',
      courseId,
      'courseWorkMaterials',
      courseWorkMaterialId,
    ],
  },
  users: {
    one: (id: string) => ['users', id],
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
    queryKey: keys.courses.courseWorks(courseId),
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

export function usePostAnnouncement(courseId: string) {
  return useMutation({
    mutationFn: (text: string) => postAnnouncement(courseId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.courses.announcements(courseId),
      })
    },
  })
}

export function useGetCourseWork(courseId: string, courseWorkId: string) {
  return useQuery({
    queryKey: keys.courses.courseWork(courseId, courseWorkId),
    queryFn: () =>
      fetchApi<classroom_v1.Schema$CourseWork>(
        `/v1/courses/${courseId}/courseWork/${courseWorkId}`,
      ),
  })
}

export function useGetCourseWorkMaterial(
  courseId: string,
  courseWorkMaterialId: string,
) {
  return useQuery({
    queryKey: keys.courses.courseWorkMaterial(courseId, courseWorkMaterialId),
    queryFn: () =>
      fetchApi<classroom_v1.Schema$CourseWorkMaterial>(
        `/v1/courses/${courseId}/courseWorkMaterials/${courseWorkMaterialId}`,
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

// TODO: refactor to cache user profiles inside the queryClient (users.one)
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
async function enrichWithCreatorProfile<T>(data: any): Promise<T> {
  if (Array.isArray(data)) {
    const enrichedData = await Promise.all(
      data.map(async (item) => {
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
    return enrichedData as T
  } else if (data.creatorUserId) {
    const profile = await fetchUserProfile(data.creatorUserId)
    return {
      ...data,
      creator: profile,
    } as T
  }
  return data as T
}

async function postAnnouncement(courseId: string, text: string) {
  const token = await getAuthToken()
  const response = await fetch(
    `${BASE_URL}/v1/courses/${courseId}/announcements`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text,
        state: 'PUBLISHED',
      }),
    },
  )

  if (!response.ok) {
    throw { message: response.statusText, status: response.status } as ApiError
  }

  return response.json()
}
