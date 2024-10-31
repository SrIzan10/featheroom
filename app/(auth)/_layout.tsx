import { Stack } from 'expo-router'

import { StackHeader } from '@/lib/ui'

const Layout = () => (
  <Stack
    screenOptions={{
      animation: 'slide_from_bottom',
      header: (props) => <StackHeader navProps={props} children={undefined} />,
    }}
  >
    <Stack.Screen name="login" options={{ title: 'Log in' }} />
    <Stack.Screen name="signup" options={{ title: 'Sign up' }} />
  </Stack>
)

export default Layout
