import { ActivityIndicator, Surface } from 'react-native-paper'

export default function Loading({ small = false }: { small?: boolean }) {
  return (
    <Surface
      className={`flex-1 flex justify-center items-center ${small ? '' : 'h-screen'}`}
    >
      <ActivityIndicator size="large" />
    </Surface>
  )
}
