import { AuthProvider, useAuth } from '@/lib/providers/auth'

import { Redirect, Slot } from 'expo-router'

export default function Root() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  )
}
