import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useColorScheme, View } from 'react-native'
import { Button, Text } from 'react-native-paper'

import { useAuth } from '@/lib/providers/auth'

function Login() {
  const { signIn, user } = useAuth()
  const router = useRouter()
  const colorScheme = useColorScheme()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  return (
    <View className="flex items-center justify-center h-screen">
      <Text
        variant="headlineMedium"
        style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}
      >
        Welcome to featheroom!
      </Text>
      <Button
        mode="contained"
        icon="google"
        onPress={async () => await signIn()}
      >
        Login with Google
      </Button>
    </View>
  )
}

export default Login
