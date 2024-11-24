/* eslint-disable no-throw-literal */
import { type classroom_v1 } from '@googleapis/classroom'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { Buffer } from 'buffer'
import * as FileSystem from 'expo-file-system'

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
  arrayZero?: boolean,
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
  const key = insideKey
    ? arrayZero
      ? (data[insideKey]?.[0] ?? null)
      : (data[insideKey] ?? [])
    : data
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
    courseWorkSubmissionState: (courseId: string, courseWorkId: string) => [
      'courses',
      courseId,
      'courseWork',
      courseWorkId,
      'submissionState',
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

export function useGetCourseWorkSubmissionState(
  courseId: string,
  courseWorkId: string,
) {
  return useQuery({
    queryKey: keys.courses.courseWorkSubmissionState(courseId, courseWorkId),
    queryFn: () =>
      fetchApi<classroom_v1.Schema$CourseWork>(
        `/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
        'studentSubmissions',
        true,
      ),
  })
}

export function useSubmitCourseWork(courseId: string, courseWorkId: string) {
  return useMutation({
    mutationFn: (files: FileData[]) =>
      uploadSubmission(courseId, courseWorkId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.courses.courseWorkSubmissionState(
          courseId,
          courseWorkId,
        ),
      })
    },
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

interface FileData {
  uri: string
  name: string
  type: string
}

async function uploadSubmission(
  courseId: string,
  courseWorkId: string,
  files: FileData[],
) {
  files.forEach((file) => {
    if (!file || !file.name || !file.type || !file.uri) {
      throw new Error(`Invalid file object: ${JSON.stringify(file)}`)
    }
  })

  console.log(`Starting upload for ${files.length} files`)
  const token = await getAuthToken()

  const uploadPromises = files.map(async (file, index) => {
    try {
      console.log(`Uploading file ${index + 1}/${files.length}: ${file.name}`)

      // Read file content as binary
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const fileBuffer = Buffer.from(fileContent, 'base64')

      // Define the boundary
      const boundary = 'foo_bar_baz'

      // Construct the multipart request body
      const multipartBody = `
--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify({
  name: file.name,
  mimeType: file.type,
})}
--${boundary}
Content-Type: ${file.type}

`

      // Convert multipart body to Uint8Array
      const preBody = Buffer.from(multipartBody, 'utf8')
      const postBody = Buffer.from(`\n--${boundary}--\n`, 'utf8')

      // Combine all parts
      const body = Buffer.concat([preBody, fileBuffer, postBody])

      const driveResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body,
        },
      )

      if (!driveResponse.ok) {
        const error = await driveResponse.text()
        throw new Error(
          `Upload failed with status ${driveResponse.status}: ${error}`,
        )
      }

      const responseData = await driveResponse.json()
      console.log(
        `File ${index + 1} uploaded successfully, Drive ID: ${responseData.id}`,
      )
      return responseData
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error)
      throw error
    }
  })

  console.log('Waiting for all uploads to complete...')
  const driveFiles = await Promise.all(uploadPromises)
  console.log(`All ${driveFiles.length} files uploaded successfully`)
  return await submitToClassroom(courseId, courseWorkId, driveFiles)
}

async function submitToClassroom(
  courseId: string,
  courseWorkId: string,
  driveFiles: { id: string }[],
) {
  console.log('Submitting to Classroom...')
  console.log(`Course ID: ${courseId}, CourseWork ID: ${courseWorkId}`)
  console.log(`Attempting to submit ${driveFiles.length} files`)

  console.log('Getting auth token...')
  const token = await getAuthToken()
  console.log('Auth token obtained')

  // Get submissions using vanilla fetch
  console.log('Fetching student submissions...')
  const submissionsResponse = await fetch(
    `${BASE_URL}/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!submissionsResponse.ok) {
    console.error(`Submission response status: ${submissionsResponse.status}`)
    throw new Error(
      `Failed to get submissions: ${submissionsResponse.statusText}`,
    )
  }

  const submissions = await submissionsResponse.json()
  console.log(
    'Submissions data received:',
    JSON.stringify(submissions, null, 2),
  )
  const submissionId = submissions.studentSubmissions[0].id
  console.log(`Using submission ID: ${submissionId}`)

  // Submit attachments
  console.log('Sending attachment modification request...')
  const attachResponse = await fetch(
    `${BASE_URL}/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId}:modifyAttachments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addAttachments: driveFiles.map((file) => ({
          driveFile: { id: file.id },
        })),
      }),
    },
  )

  if (!attachResponse.ok) {
    console.error(`Attach response status: ${attachResponse.status}`)
    const json = await attachResponse.json()
    console.error(`Failed to attach files: ${JSON.stringify(json, null, 2)}`)
    return
  }

  console.log('Attachment modification completed')
  const response = await attachResponse.json()
  console.log('Final response:', JSON.stringify(response, null, 2))
  return response
}
