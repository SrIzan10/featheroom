import {
  GoogleSignin,
  type User,
} from '@react-native-google-signin/google-signin'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    GoogleSignin.configure({
      scopes: [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.me',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      ],
    })

    setUser(GoogleSignin.getCurrentUser())
  }, [])

  const signIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      setUser(userInfo.data)
      return userInfo
    } catch (error) {
      console.error(error)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut()
      setUser(null)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const authContextValue = useMemo(
    () => ({ user, signIn, signOut }),
    [user, signIn, signOut],
  )

  return (
    <AuthContext.Provider value={authContextValue}>
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
