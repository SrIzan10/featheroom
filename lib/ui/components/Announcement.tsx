import { Image } from 'expo-image'
import { View } from 'react-native'
import { Card, Text, Avatar } from 'react-native-paper'

import { AnnouncementUserProfile } from '@/lib/types/Classroom'

export default function Announcement(props: AnnouncementUserProfile) {
  const date = new Date(props.creationTime!)
  return (
    <View className="m-2.5">
      <Card className="border border-gray-200 dark:border-gray-700">
        <Card.Title
          title={
            props.creator ? props.creator.name?.givenName : '(unknown user)'
          }
          subtitle={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}
          left={(iP) =>
            props.creator && props.creator.photoUrl ? (
              <Image
                source={`https:${props.creator.photoUrl}`}
                style={{
                  width: iP.size,
                  height: iP.size,
                  borderRadius: iP.size / 2,
                }}
                {...iP}
              />
            ) : (
              <Avatar.Icon {...iP} icon="account" />
            )
          }
        />
        <Card.Content>
          <Text className="pt-2" variant="bodyMedium">
            {props.text}
          </Text>
        </Card.Content>
      </Card>
    </View>
  )
}
