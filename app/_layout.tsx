import { Slot } from 'expo-router'
import { PaperProvider } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store'
import { AuthProvider } from '@/lib/providers/auth'
import { useColorScheme } from 'react-native'
import { useEffect, useState } from 'react'
import { Setting } from '@/lib/types'
import { Themes } from '@/lib/ui'

import '../global.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/clients/classroom'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function Root() {
  const colorScheme = useColorScheme()
  const [settings, setSettings] = useState<Setting>({
    theme: 'auto',
    color: 'default',
  })

  // Load settings from the device
  useEffect(() => {
    SecureStore.getItemAsync('settings').then((result) => {
      if (result === null) {
        SecureStore.setItemAsync('settings', JSON.stringify(settings)).then(
          (res) => console.log(res),
        )
      }

      setSettings(JSON.parse(result ?? JSON.stringify(settings)))
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider
        theme={
          Themes[
            settings.theme === 'auto' ? (colorScheme ?? 'dark') : settings.theme
          ][settings.color]
        }
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </QueryClientProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  )
}
