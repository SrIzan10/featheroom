import { Link, Stack } from 'expo-router'
import React from 'react'
import { Surface, Text } from 'react-native-paper'

import { styles } from '@/lib/ui'

const NotFound = () => (
  <Surface style={styles.screen}>
    <Stack.Screen options={{ title: 'Not Found' }} />

    <Text variant="displayLarge">Not Found</Text>

    <Text variant="bodyLarge">
      The screen you are looking for does not exist.
    </Text>

    <Link href="/">
      <Text variant="bodyLarge">Go Home</Text>
    </Link>
  </Surface>
)

export default NotFound
