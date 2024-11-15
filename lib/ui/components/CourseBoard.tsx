import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Surface } from 'react-native-paper'

import {
  useAnnouncements,
  useCourseWork,
  useCourseWorkMaterials,
} from '@/lib/clients/classroom'

import AddAnnouncement from './AddAnnouncement'
import Announcement from './Announcement'
import CourseWorkCard from './CourseWorkCard'
import Loading from './Loading'

export default function CourseBoard() {
  const { id } = useLocalSearchParams() as { id: string }
  const [organizedData, setOrganizedData] = useState<JSX.Element[]>([])

  const { data: announcement, isFetching: annIsLoading } = useAnnouncements(id)
  const { data: courseWork, isFetching: cwIsLoading } = useCourseWork(id)
  const { data: courseWorkMaterial, isFetching: cwmIsLoading } =
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
    sorted.unshift(<AddAnnouncement key="add-announcement" />)

    setOrganizedData(sorted)
    // following eslint rule is not really needed for this one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcement, courseWork, courseWorkMaterial])

  // inside a useeffect to make the loading spinner appear when adding a new announcement for example
  useEffect(() => {
    if (annIsLoading || cwIsLoading || cwmIsLoading) {
      setOrganizedData([<Loading key="loading" />])
    }
  }, [annIsLoading, cwIsLoading, cwmIsLoading])

  return <Surface className="flex-1">{organizedData}</Surface>
}
