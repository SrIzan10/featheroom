import { useLocalSearchParams } from 'expo-router'

export default function CourseWorkViewer() {
  const { ids } = useLocalSearchParams() as { ids: string[] }
}
