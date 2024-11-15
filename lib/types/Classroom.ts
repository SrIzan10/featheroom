// miscellaneous google classroom type combinations

import type { classroom_v1 } from '@googleapis/classroom'

export type AnnouncementUserProfile = classroom_v1.Schema$Announcement & {
  creator?: classroom_v1.Schema$UserProfile
}

export type CourseWorkUserProfile = classroom_v1.Schema$CourseWork & {
  creator?: classroom_v1.Schema$UserProfile
}

export type CourseWorkMaterialUserProfile = classroom_v1.Schema$CourseWorkMaterial & {
  creator?: classroom_v1.Schema$UserProfile
}