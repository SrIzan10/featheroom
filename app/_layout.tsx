import { QueryClientProvider } from '@tanstack/react-query'
import { Slot } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'

import { queryClient } from '@/lib/clients/classroom'
import { AuthProvider } from '@/lib/providers/auth'
import { Setting } from '@/lib/types'
import { Themes } from '@/lib/ui'

import '../global.css'

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
  )
}
