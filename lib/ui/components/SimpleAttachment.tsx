import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Icon, Text } from 'react-native-paper'

export default function SimpleAttachment(props: Props) {
  const [clicked, setClicked] = useState(false)
  return (
    <Pressable
      onPress={async () => {
        setClicked(true)
        const browse = await WebBrowser.openBrowserAsync(props.link)
        if (browse.type) {
          setClicked(false)
        }
      }}
    >
      <View className="flex flex-row gap-3 items-center pt-2">
        <Icon source={clicked ? 'dots-horizontal' : 'attachment'} size={20} />
        <Text className="text-xl">{props.title}</Text>
      </View>
    </Pressable>
  )
}

interface Props {
  title: string
  link: string
}
