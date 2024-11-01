import {
  GoogleSignin,
  type User,
} from '@react-native-google-signin/google-signin'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)

  GoogleSignin.configure({
    scopes: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me',
      'https://www.googleapis.com/auth/classroom.coursework.students',
      'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    ],
  })

  useEffect(() => {
    setUser(GoogleSignin.getCurrentUser())
  }, [])

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      setUser(userInfo.data)
      return userInfo
    } catch (error) {
      console.error(error)
    }
  }

  const signOut = async () => {
    try {
      await GoogleSignin.signOut()
      setUser(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

interface AuthContextType {
  user: User | null
  signIn: () => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => null,
  signOut: async () => {},
})

export const useAuth = (): AuthContextType => useContext(AuthContext)
