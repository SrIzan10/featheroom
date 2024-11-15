import {
  useAnnouncements,
  useCourseWork,
  useCourseWorkMaterials,
} from '@/lib/clients/classroom'
import { useLocalSearchParams } from 'expo-router'
import Loading from './Loading'
import { Surface, Text } from 'react-native-paper'
import { useEffect, useState } from 'react'
import Announcement from './Announcement'
import CourseWorkCard from './CourseWorkCard'
import { ScrollView } from 'react-native'

export default function CourseBoard() {
  const { id } = useLocalSearchParams() as { id: string }
  const [organizedData, setOrganizedData] = useState<JSX.Element[]>([])

  const { data: announcement, isLoading: annIsLoading } = useAnnouncements(id)
  const { data: courseWork, isLoading: cwIsLoading } = useCourseWork(id)
  const { data: courseWorkMaterial, isLoading: cwmIsLoading } =
    useCourseWorkMaterials(id)

  useEffect(() => {
    console.log('ann', JSON.stringify(announcement))
    console.log('cw', courseWork)
    console.log('cwm', courseWorkMaterial)
  }, [announcement, courseWork, courseWorkMaterial])

  useEffect(() => {
    if (annIsLoading || cwIsLoading || cwmIsLoading) {
      return
    }

    const combined = [
      ...(announcement?.map((a) => ({
        type: 'announcement',
        data: a,
        creationTime: new Date(a.creationTime!).getTime(),
      })) || []),
      ...(courseWork?.map((cw) => ({
        type: 'coursework',
        data: cw,
        creationTime: new Date(cw.creationTime!).getTime(),
      })) || []),
      ...(courseWorkMaterial?.map((cwm) => ({
        type: 'material',
        data: cwm,
        creationTime: new Date(cwm.creationTime!).getTime(),
      })) || []),
    ]

    const sorted = combined
      .sort((a, b) => b.creationTime - a.creationTime)
      .map((item) => {
        switch (item.type) {
          case 'announcement':
            return <Announcement key={item.data.id} {...item.data} />
          case 'coursework':
            return (
              <CourseWorkCard
                key={item.data.id}
                isCWM={false}
                data={item.data}
              />
            )
          case 'material':
            return <CourseWorkCard key={item.data.id} isCWM data={item.data} />
        }
      })
      .filter((item) => item !== undefined)

    setOrganizedData(sorted)
    // following eslint rule is not really needed for this one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcement, courseWork, courseWorkMaterial])

  if (annIsLoading || cwIsLoading || cwmIsLoading) {
    return <Loading />
  }

  return (
    <Surface className="flex-1">
      {/* <Text>Announcements</Text>
      {announcement?.map((a) => <Announcement key={a.id} {...a} />)}
      <Text>Course Work</Text>
      {courseWork &&
        courseWork.map((cw) => (
          <CourseWorkCard key={cw.id} isCWM={false} data={cw} />
        ))}
      <Text>Course Work Material</Text>
      {courseWorkMaterial &&
        courseWorkMaterial.map((cwm) => (
          <CourseWorkCard key={cwm.id} isCWM data={cwm} />
        ))} */}
      {organizedData}
    </Surface>
  )
}
