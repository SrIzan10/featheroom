import { List, Surface, Text } from 'react-native-paper'

import { useCourses } from '@/lib/clients/classroom'
import { View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import Loading from '@/lib/ui/components/Loading'

function TabsHome() {
  const { data, isLoading } = useCourses()

  if (isLoading) {
    return <Loading />
  }

  return (
    <Surface className="flex-1">
      <Text>My Courses</Text>
      {data?.courses.map((course) => (
        <Link href={`/drawer/courses/${course.id}`} key={course.id}>
          {course.name}
        </Link>
      ))}
    </Surface>
  )
}

export default TabsHome
