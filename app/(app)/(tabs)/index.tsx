import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'
import { Surface } from 'react-native-paper'

import { useCourses } from '@/lib/clients/classroom'
import CourseCard from '@/lib/ui/components/CourseCard'
import Loading from '@/lib/ui/components/Loading'

function TabsHome() {
  const { data, isLoading } = useCourses()
  const router = useRouter()

  if (isLoading) {
    return <Loading />
  }

  return (
    <Surface className="flex-1">
      {data?.courses.map((course) => (
        <Pressable
          key={course.id}
          onPress={() => {
            router.push(`/drawer/courses/${course.id}`)
          }}
        >
          <CourseCard key={course.id} {...course} />
        </Pressable>
      ))}
    </Surface>
  )
}

export default TabsHome
