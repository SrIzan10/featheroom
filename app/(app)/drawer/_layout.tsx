import { Drawer } from 'expo-router/drawer'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useTheme } from 'react-native-paper'

import { DrawerContent, DrawerHeader } from '../../../lib/ui/components'

const DrawerLayout = () => {
  const theme = useTheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => (
          <DrawerContent
            navProps={props}
            showDivider={false}
            children={undefined}
            title="Drawer Navigation"
          />
        )}
        screenOptions={{
          drawerStyle: {
            backgroundColor: theme.colors.background,
            paddingTop: 32,
          },
          header: (props) => (
            <DrawerHeader navProps={props} children={undefined} />
          ),
        }}
      >
        <Drawer.Screen
          name="courses/[id]"
          options={{
            drawerLabel: 'Courses',
            title: 'Courses',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}

export default DrawerLayout
