import { useLocalSearchParams, useRouter } from 'expo-router'
import { View, Pressable } from 'react-native'
import { Card, Avatar } from 'react-native-paper'

export default function AddAnnouncement() {
  const { id } = useLocalSearchParams() as { id: string }
  const router = useRouter()

  return (
    <View className="m-2.5">
      <Pressable
        onPress={() => router.push(`/drawer/courses/announcement/create/${id}`)}
      >
        <Card className="border border-gray-200 dark:border-gray-700">
          <Card.Title
            title="Create a new announcement"
            left={(iP) => <Avatar.Icon {...iP} icon="plus" />}
          />
        </Card>
      </Pressable>
    </View>
  )
}
