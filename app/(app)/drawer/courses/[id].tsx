import { useCourse } from '@/lib/clients/classroom'
import CourseBoard from '@/lib/ui/components/CourseBoard'
import Loading from '@/lib/ui/components/Loading'
import { useLocalSearchParams } from 'expo-router'
import { Surface, Text } from 'react-native-paper'

export default function Courses() {
  const { id } = useLocalSearchParams() as { id: string }
  const { data: course, isLoading } = useCourse(id)

  if (isLoading) {
    return <Loading />
  }

  return (
    <Surface className="flex-1">
      <Text>hi this is class with name {course?.name}</Text>
      <CourseBoard />
    </Surface>
  )
}
