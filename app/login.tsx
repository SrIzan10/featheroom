import { useAuth } from '@/lib/providers/auth'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'

function Login() {
  const { signIn, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      console.log('redicrecting')
      router.push('/')
    }
  }, [user])
  useEffect(() => {
    console.log('login page')
  }, [])
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 16,
      }}
    >
      <Text variant="headlineMedium">Welcome</Text>
      <Button mode="contained" icon="google" onPress={async () => await signIn()}>
        Login with Google
      </Button>
    </View>
  )
}

export default Login
