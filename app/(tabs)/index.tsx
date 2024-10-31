import React from 'react'
import { Surface } from 'react-native-paper'

import { ScreenInfo, styles } from '@/lib/ui'

const TabsHome = () => (
  <Surface style={styles.screen}>
    <ScreenInfo title="Home" path="app/(tabs)/index.tsx" />
  </Surface>
)

export default TabsHome
