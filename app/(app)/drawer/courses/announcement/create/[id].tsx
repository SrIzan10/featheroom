import { usePostAnnouncement } from '@/lib/clients/classroom'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ToastAndroid } from 'react-native'
import { Button, Surface, TextInput } from 'react-native-paper'

export default function Page() {
  const { id } = useLocalSearchParams() as { id: string }
  const { mutate: postAnnouncement, isPending } = usePostAnnouncement(id)
  const [text, setText] = useState('')
  const router = useRouter()

  return (
    <Surface className="flex-1">
      <TextInput
        label="Announcement"
        multiline
        numberOfLines={4}
        value={text}
        onChangeText={setText}
      />
      <Button
        onPress={() => {
          postAnnouncement(text, {
            onSuccess: () => {
              ToastAndroid.show('Announcement posted', ToastAndroid.SHORT)
              router.push(`/drawer/courses/${id}`)
            },
          })
        }}
        loading={isPending}
      >
        Submit
      </Button>
    </Surface>
  )
}
