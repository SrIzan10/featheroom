import type { classroom_v1 } from '@googleapis/classroom'
import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { Surface, Text } from 'react-native-paper'

import { useGetCourseWork } from '@/lib/clients/classroom'
import CourseWorkUploader from '@/lib/ui/components/CourseWorkUploader'
import Loading from '@/lib/ui/components/Loading'
import SimpleAttachment from '@/lib/ui/components/SimpleAttachment'

export default function CourseWorkViewer() {
  const { ids } = useLocalSearchParams() as { ids: string[] }
  const courseId = ids[0]
  const courseWorkId = ids[1]
  const { data, isLoading } = useGetCourseWork(courseId, courseWorkId)

  useEffect(() => {
    console.log('get course work', data)
  }, [data])

  if (isLoading) return <Loading />

  // TODO: Add support for non-assignment work types
  if (data?.workType !== 'ASSIGNMENT')
    return (
      <Surface>
        <Text>Non assignments are not supported temporarily.</Text>
      </Surface>
    )

  return (
    <Surface className="flex-1">
      <ScrollView>
        <View className="p-4">
          <Text variant="headlineMedium" className="pb-3">
            {data?.title}
          </Text>

          <Text variant="headlineSmall">Description</Text>
          <Text>{data?.description}</Text>

          {data?.materials && (
            <>
              <Text variant="headlineSmall">Attachments</Text>
              {data.materials.map((material) => {
                // TODO: Move to classroom utils file
                const getAttachmentDetails = (
                  material: classroom_v1.Schema$Material,
                ) => {
                  if (material.driveFile) {
                    return {
                      title: material.driveFile.driveFile!.title!,
                      link: material.driveFile.driveFile!.alternateLink!,
                    }
                  }
                  if (material.youtubeVideo) {
                    return {
                      title: material.youtubeVideo.title!,
                      link: material.youtubeVideo.alternateLink!,
                    }
                  }
                  if (material.link) {
                    return {
                      title: material.link.title || material.link.url,
                      link: material.link.url!,
                    }
                  }
                  if (material.form) {
                    return {
                      title: material.form.title!,
                      link: material.form.formUrl!,
                    }
                  }
                  return {
                    title: 'Unknown Material Type',
                    link: '#',
                  }
                }

                const { title, link } = getAttachmentDetails(material)
                return (
                  <SimpleAttachment key={link} title={title!} link={link} />
                )
              })}
            </>
          )}
          <CourseWorkUploader />
        </View>
      </ScrollView>
    </Surface>
  )
}
