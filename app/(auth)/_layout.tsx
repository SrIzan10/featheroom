import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'

import { useAuth } from '@/lib/providers/auth'

function Layout() {
  const { signIn, user } = useAuth()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button onPress={async () => await signIn()}>log in!</Button>
      <Text>this is {JSON.stringify(user)}.</Text>
    </View>
    /* <Stack
      screenOptions={{
        animation: 'slide_from_bottom',
        header: (props) => (
          <StackHeader navProps={props} children={undefined} />
        ),
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Log in' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign up' }} />
      </Stack> */
  )
}

export default Layout
