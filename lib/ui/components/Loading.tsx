import { ActivityIndicator, Surface } from 'react-native-paper'

export default function Loading() {
  return (
    <Surface className="flex-1 h-screen flex justify-center items-center">
      <ActivityIndicator size="large" />
    </Surface>
  )
}
