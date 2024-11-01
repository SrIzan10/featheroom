import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
  useFonts,
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono'
import { NotoSans_400Regular } from '@expo-google-fonts/noto-sans'
import { Redirect, SplashScreen, Stack, useRootNavigationState, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React from 'react'
import { Platform, useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'

import { AuthProvider, useAuth } from '@/lib/providers/auth'
import { Setting } from '@/lib/types'
import { StackHeader, Themes } from '@/lib/ui'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

const RootLayout = () => {
  const [loaded, error] = useFonts({
    NotoSans_400Regular,
    JetBrainsMono_400Regular,
    ...MaterialCommunityIcons.font,
  })

  // Get authentication state
  const rootNavigationState = useRootNavigationState()

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  React.useEffect(() => {
    if (error) throw error
  }, [error])

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  // Make sure we have the navigation state before showing content
  if (!loaded || !rootNavigationState) {
    return null
  }

  return <RootLayoutNav />
}

const RootLayoutNav = () => {
  const colorScheme = useColorScheme()
  const [settings, setSettings] = React.useState<Setting>({
    theme: 'auto',
    color: 'default',
  })

  // Load settings from the device
  React.useEffect(() => {
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
    <AuthProvider>
      <PaperProvider
        theme={
          Themes[
            settings.theme === 'auto' ? (colorScheme ?? 'dark') : settings.theme
          ][settings.color]
        }
      >
        <Stack
          screenOptions={{
            animation: 'slide_from_bottom',
            header: (props) => (
              <StackHeader navProps={props} children={undefined} />
            ),
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="drawer" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ title: 'Search' }} />
          <Stack.Screen
            name="modal"
            options={{ title: 'Modal', presentation: 'modal' }}
          />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  )
}

export default RootLayout
