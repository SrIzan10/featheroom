import type { classroom_v1 } from '@googleapis/classroom'
import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { Surface, Text } from 'react-native-paper'

import { useGetCourseWorkMaterial } from '@/lib/clients/classroom'
import Loading from '@/lib/ui/components/Loading'
import SimpleAttachment from '@/lib/ui/components/SimpleAttachment'

// TODO: Unify both courseWork and courseWorkMaterial viewers into one.
// It doesn't really change much, just the query hook and the workType check.
export default function CourseWorkMaterialViewer() {
  const { ids } = useLocalSearchParams() as { ids: string[] }
  const courseId = ids[0]
  const courseWorkId = ids[1]
  const { data, isLoading } = useGetCourseWorkMaterial(courseId, courseWorkId)

  useEffect(() => {
    console.log('get course work material', data)
  }, [data])

  if (isLoading) return <Loading />

  return (
    <Surface className="flex-1">
      <View className="p-4">
        <Text variant="headlineMedium" className="pb-3">
          {data?.title}
        </Text>

        {data?.description && (
          <>
            <Text variant="headlineSmall">Description</Text>
            <Text>{data?.description}</Text>
          </>
        )}

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
              return <SimpleAttachment key={link} title={title!} link={link} />
            })}
          </>
        )}
      </View>
    </Surface>
  )
}
