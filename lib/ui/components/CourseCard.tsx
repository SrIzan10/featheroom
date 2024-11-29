import type { classroom_v1 } from '@googleapis/classroom'
import { View } from 'react-native'
import { Card, Text } from 'react-native-paper'

const COURSE_COLORS = [
  'bg-green-600',
  'bg-blue-600',
  'bg-yellow-500',
  'bg-red-600',
  'bg-pink-400',
  'bg-gray-500',
]

export default function CourseCard(course: classroom_v1.Schema$Course) {
  const { name, section, courseState, id } = course
  const colorIndex = parseInt(id || '0', 16) % COURSE_COLORS.length
  const bannerColor = COURSE_COLORS[colorIndex]

  return (
    <Card className="mx-4 my-2 rounded-lg overflow-hidden">
      <Card.Content className={`p-4 pb-6 ${bannerColor}`}>
        <Text variant="titleLarge" className="font-bold text-white">
          {name || 'Untitled Course'}
        </Text>
      </Card.Content>

      <Card.Content className="p-4">
        {section && (
          <Text variant="bodyMedium" className="text-gray-600 mb-1">
            {section}
          </Text>
        )}
        {courseState && courseState !== 'ACTIVE' && (
          <View className="absolute right-4 top-2 bg-black/5 px-2 py-0.5 rounded">
            <Text variant="labelSmall" className="text-gray-700">
              {courseState}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  )
}
