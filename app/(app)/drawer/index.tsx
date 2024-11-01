import React from 'react'
import { Surface } from 'react-native-paper'

import { ScreenInfo, styles } from '@/lib/ui'

const DrawerHome = () => (
  <Surface style={styles.screen}>
    <ScreenInfo title="Home" path="app/drawer/index.tsx" />
  </Surface>
)

export default DrawerHome
