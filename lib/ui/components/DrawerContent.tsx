import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { router } from 'expo-router'
import React from 'react'
import { Drawer, DrawerSectionProps } from 'react-native-paper'

interface DrawerContentProps extends DrawerSectionProps {
  navProps: DrawerContentComponentProps
}

const DrawerContent = (props: DrawerContentProps) => (
  <Drawer.Section {...props}>
    <Drawer.Item
      label="Go Home"
      icon="arrow-left"
      onPress={() => router.replace('/')}
    />
  </Drawer.Section>
)

export default DrawerContent
