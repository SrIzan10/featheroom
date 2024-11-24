import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Button, Card, Text } from 'react-native-paper'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'

import {
  classroomDateTimeToISO,
  useGetCourseWork,
  useGetCourseWorkSubmissionState,
  useSubmitCourseWork,
} from '@/lib/clients/classroom'

import Loading from './Loading'
import { GestureResponderEvent } from 'react-native'

export default function CourseWorkUploader() {
  const { ids } = useLocalSearchParams() as { ids: string[] }
  const courseId = ids[0]
  const courseWorkId = ids[1]
  const { data: cwInfo, isLoading: cwInfoLoading } = useGetCourseWork(
    courseId,
    courseWorkId,
  )
  const { data: state, isLoading: stateLoading } =
    useGetCourseWorkSubmissionState(courseId, courseWorkId)
  const [date, setDate] = useState<Date | null>(null)
  useEffect(() => {
    if (cwInfo!.dueDate) {
      setDate(
        new Date(classroomDateTimeToISO(cwInfo!.dueDate!, cwInfo!.dueTime!)),
      )
    }
  }, [cwInfo])

  // TODO: all file uploads have to happen at the same time, else they are gone.
  const { mutate: submitWork, isPending: submitWorkPending } =
    useSubmitCourseWork(courseId, courseWorkId)
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null)

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow any file type
      })

      if (result.canceled) return

      setSelectedFile(result)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: GestureResponderEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    try {
      const files = selectedFile.assets!.map((asset) => ({
        uri: asset.uri,
        name: asset.name || 'file',
        type: asset.mimeType || 'application/octet-stream',
      }))

      submitWork(files)
    } catch (err) {
      console.error(err)
    }
  }

  if (cwInfoLoading || stateLoading) return <Loading small />

  return (
    <Card mode="outlined" className="mt-3">
      <Card.Title
        title="Your Work"
        subtitle={
          date ? (
            <Text>
              Due {date.toLocaleDateString()}, {date.toLocaleTimeString()}
            </Text>
          ) : (
            <Text>No due date</Text>
          )
        }
      />
      <Card.Content>
        <Text>{JSON.stringify(selectedFile)}</Text>
      </Card.Content>
      <Card.Actions className="flex justify-between">
        <Button className="flex-1 mr-2" icon="plus" onPress={handleFilePick}>
          Add
        </Button>
        <Button
          className="flex-1"
          onPress={handleSubmit}
          loading={submitWorkPending}
        >
          Submit
        </Button>
      </Card.Actions>
    </Card>
  )
}

function base64ToBlob(base64: string, contentType: string) {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => {
    return byteCharacters.charCodeAt(i)
  })
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}
