import * as WebBrowser from 'expo-web-browser'
import { Pressable, View } from 'react-native'
import { Icon, Text } from 'react-native-paper'

export default function SimpleAttachment(props: Props) {
  return (
    <Pressable
      onPress={async () => {
        await WebBrowser.openBrowserAsync(props.link)
      }}
    >
      <View className="flex flex-row gap-3 items-center pt-2">
        <Icon source="attachment" size={20} />
        <Text className="text-xl">{props.title}</Text>
      </View>
    </Pressable>
  )
}

interface Props {
  title: string
  link: string
}
