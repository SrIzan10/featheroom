import { useLocalSearchParams } from 'expo-router'
import { ScrollView } from 'react-native'
import { Surface, Text, useTheme } from 'react-native-paper'

import { useCourse } from '@/lib/clients/classroom'
import AddAnnouncement from '@/lib/ui/components/AddAnnouncement'
import CourseBoard from '@/lib/ui/components/CourseBoard'
import Loading from '@/lib/ui/components/Loading'

export default function Courses() {
  const { id } = useLocalSearchParams() as { id: string }
  const { data: course, isLoading } = useCourse(id)
  const theme = useTheme()

  if (isLoading) {
    return <Loading />
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        // this is not fine.
        backgroundColor: theme.colors.elevation.level1,
      }}
    >
      <Surface className="flex-1">
        <AddAnnouncement />
        <Text>hi this is class with name {course?.name}</Text>
        <CourseBoard />
      </Surface>
    </ScrollView>
  )
}
