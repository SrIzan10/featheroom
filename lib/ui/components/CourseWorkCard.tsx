import { View } from 'react-native'
import { Card, Avatar, Text } from 'react-native-paper'

import { classroomDateTimeToISO } from '@/lib/clients/classroom'
import {
  CourseWorkMaterialUserProfile,
  CourseWorkUserProfile,
} from '@/lib/types/Classroom'

export default function CourseWorkCard(props: Props) {
  const getIcon = () => {
    if (props.isCWM) return 'file-document-outline'
    return 'clipboard-text-outline'
  }
  const getDateString = () => {
    if (!props.isCWM && props.data.dueDate) {
      const date = new Date(
        classroomDateTimeToISO(props.data.dueDate, props.data.dueTime!),
      )
      return `Due ${date.toLocaleDateString()}`
    }
    return 'No due date'
  }

  return (
    <View className="m-2.5">
      <Card className="border border-gray-200 dark:border-gray-700">
        <Card.Title
          title={props.data.title}
          subtitle={!props.isCWM && getDateString()}
          left={(ip) => (
            <Avatar.Icon
              {...ip}
              icon={getIcon()}
              className="bg-blue-100 dark:bg-blue-900"
            />
          )}
          right={(ip) =>
            !props.isCWM &&
            props.data.maxPoints && (
              <Text {...ip} className="mr-4">
                {props.data.maxPoints} points
              </Text>
            )
          }
        />
      </Card>
    </View>
  )
}

type Props =
  | { isCWM: true; data: CourseWorkMaterialUserProfile }
  | { isCWM: false; data: CourseWorkUserProfile }
