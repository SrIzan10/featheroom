import {
  useAnnouncements,
  useCourseWork,
  useCourseWorkMaterials,
} from '@/lib/clients/classroom'
import { useLocalSearchParams } from 'expo-router'
import Loading from './Loading'
import { Surface, Text } from 'react-native-paper'
import { useEffect } from 'react'

export default function CourseBoard() {
  const { id } = useLocalSearchParams() as { id: string }

  const { data: announcement, isLoading: annIsLoading } = useAnnouncements(id)
  const { data: courseWork, isLoading: cwIsLoading } = useCourseWork(id)
  const { data: courseWorkMaterial, isLoading: cwmIsLoading } =
    useCourseWorkMaterials(id)

  useEffect(() => {
    console.log('ann', announcement)
    console.log('cw', courseWork)
    console.log('cwm', courseWorkMaterial)
  }, [announcement, courseWork, courseWorkMaterial])

  if (annIsLoading || cwIsLoading || cwmIsLoading) {
    return <Loading />
  }

  return (
    <Surface className="flex-1">
      <Text>Announcements</Text>
      {announcement?.map((a) => <Text key={a.id}>{a.text}</Text>)}
      <Text>Course Work</Text>
      {courseWork &&
        courseWork.map((cw) => <Text key={cw.id}>{cw.title}</Text>)}
      <Text>Course Work Material</Text>
      {courseWorkMaterial &&
        courseWorkMaterial.map((cwm) => <Text key={cwm.id}>{cwm.title}</Text>)}
    </Surface>
  )
}
