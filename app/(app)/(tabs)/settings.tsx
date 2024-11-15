import * as SecureStore from 'expo-secure-store'
import React from 'react'
import { Platform, useColorScheme } from 'react-native'
import {
  Surface,
  List,
  Menu,
  Button,
  IconButton,
  Snackbar,
  Icon,
} from 'react-native-paper'

import { Color, Setting } from '@/lib/types'
import { Colors, LoadingIndicator, ScreenInfo, styles } from '@/lib/ui'
import { reloadAppAsync } from 'expo'
import { useAuth } from '@/lib/providers/auth'
import { Image } from 'expo-image'
import { queryClient } from '@/lib/clients/classroom'

const Settings = () => {
  const colorScheme = useColorScheme()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [message, setMessage] = React.useState({ visible: false, content: '' })
  const { user, signIn, signOut } = useAuth()
  const [settings, setSettings] = React.useState<Setting>({
    color: 'default',
    theme: 'auto',
  })
  const [display, setDisplay] = React.useState({
    color: false,
    theme: false,
  })

  React.useEffect(() => {
    setLoading(true)

    if (Platform.OS !== 'web') {
      SecureStore.getItemAsync('settings')
        .then((result) =>
          setSettings(JSON.parse(result ?? JSON.stringify(settings))),
        )
        .catch((res) =>
          setMessage({
            visible: true,
            content: res.message,
          }),
        )
    }

    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const themeColors =
    Colors[
      settings.theme === 'auto' ? (colorScheme ?? 'light') : settings.theme
    ]

  return (
    <Surface style={{ flex: 1 }}>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <Surface elevation={0}>
          <List.AccordionGroup>
            <List.Accordion
              id="1"
              title="Appearance"
              left={(props) => <List.Icon {...props} icon="palette" />}
            >
              <List.Item
                title="Mode"
                description="Change Mode"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={
                      settings.theme === 'auto'
                        ? 'theme-light-dark'
                        : settings.theme === 'light'
                          ? 'weather-sunny'
                          : 'weather-night'
                    }
                  />
                )}
                right={(props) => (
                  <Menu
                    visible={display.theme}
                    onDismiss={() => setDisplay({ ...display, theme: false })}
                    anchor={
                      <IconButton
                        {...props}
                        icon="pencil"
                        onPress={() => setDisplay({ ...display, theme: true })}
                      />
                    }
                  >
                    <Menu.Item
                      title="System"
                      leadingIcon="theme-light-dark"
                      trailingIcon={
                        settings.theme === 'auto' ? 'check' : undefined
                      }
                      onPress={() => {
                        setSettings({ ...settings, theme: 'auto' })
                        setDisplay({ ...display, theme: false })
                      }}
                    />
                    <Menu.Item
                      title="Light Mode"
                      leadingIcon="weather-sunny"
                      trailingIcon={
                        settings.theme === 'light' ? 'check' : undefined
                      }
                      onPress={() => {
                        setSettings({ ...settings, theme: 'light' })
                        setDisplay({ ...display, theme: false })
                      }}
                    />
                    <Menu.Item
                      title="Dark Mode"
                      leadingIcon="weather-night"
                      trailingIcon={
                        settings.theme === 'dark' ? 'check' : undefined
                      }
                      onPress={() => {
                        setSettings({ ...settings, theme: 'dark' })
                        setDisplay({ ...display, theme: false })
                      }}
                    />
                  </Menu>
                )}
              />
              <List.Item
                title="Color"
                description="Change Color"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="palette-swatch-variant"
                    color={
                      Colors[
                        settings.theme === 'auto'
                          ? (colorScheme ?? 'light')
                          : settings.theme
                      ][settings.color]?.primary
                    }
                  />
                )}
                right={(props) => (
                  <Menu
                    visible={display.color}
                    onDismiss={() => setDisplay({ ...display, color: false })}
                    anchor={
                      <IconButton
                        {...props}
                        icon="pencil"
                        onPress={() => setDisplay({ ...display, color: true })}
                      />
                    }
                  >
                    {Object.keys(Colors.light).map((color) => (
                      <Surface
                        key={color}
                        elevation={0}
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Surface
                          elevation={0}
                          style={{
                            padding: 4,
                            marginLeft: 8,
                            borderRadius: 16,
                            backgroundColor:
                              color !== settings.color
                                ? undefined
                                : themeColors[color]?.primary,
                          }}
                        >
                          <Icon
                            size={24}
                            source="palette"
                            color={
                              color !== settings.color
                                ? themeColors[color as Color]?.primary
                                : themeColors[color].onPrimary
                            }
                          />
                        </Surface>

                        <Menu.Item
                          key={color}
                          title={color}
                          onPress={() => {
                            setSettings({
                              ...settings,
                              color: color as Color,
                            })
                            setDisplay({ ...display, color: false })
                          }}
                        />
                      </Surface>
                    ))}
                  </Menu>
                )}
              />
              <Button
                mode="contained"
                style={{ margin: 16 }}
                icon="content-save"
                onPress={() =>
                  SecureStore.setItemAsync('settings', JSON.stringify(settings))
                    .then(async () => {
                      setMessage({
                        visible: true,
                        content: 'Restarting app...',
                      })
                      await reloadAppAsync()
                    })
                    .catch((res) =>
                      setMessage({
                        visible: true,
                        content: res.message,
                      }),
                    )
                }
              >
                Save
              </Button>
            </List.Accordion>
          </List.AccordionGroup>
        </Surface>
      )}

      {/* make a surface for the authentication */}
      <Surface elevation={0}>
        <List.Accordion
          id="2"
          title="Authentication"
          left={(props) => <List.Icon {...props} icon={'account'} />}
        >
          {user ? (
            <>
              <List.Item
                title={`Hey ${user.user.givenName}!`}
                description="Click here to check more info"
                left={(props) => <List.Icon {...props} icon="fingerprint" />}
              />
              <List.Item
                title="Sign Out"
                description="Sign out of your account"
                left={(props) => <List.Icon {...props} icon="logout" />}
                onPress={async () => {
                  await signOut()
                }}
              />
            </>
          ) : (
            <>
              <List.Item
                title="Login"
                description="Log in to your account"
                left={(props) => <List.Icon {...props} icon="login" />}
                onPress={async () => {
                  await signIn()
                }}
              />
            </>
          )}
        </List.Accordion>
      </Surface>

      {__DEV__ && (
        <Surface elevation={0}>
          <List.Accordion
            id="3"
            title="Developer"
            left={(props) => <List.Icon {...props} icon="code-tags" />}
          >
            <List.Item
              title="Clear query cache"
              description="Clear tanstack query cache"
              left={(props) => <List.Icon {...props} icon="delete-forever" />}
              onPress={async () => {
                queryClient.clear()
                setMessage({
                  visible: true,
                  content:
                    'Cache cleared. Wait 1s for the persisters to actually clear',
                })
              }}
            />
            <List.Item
              title="Clear settings"
              description="Clear all setttings"
              left={(props) => <List.Icon {...props} icon="delete" />}
              onPress={async () => {
                await SecureStore.deleteItemAsync('settings')
                setMessage({
                  visible: true,
                  content: 'Settings cleared',
                })
                await reloadAppAsync()
              }}
            />
          </List.Accordion>
        </Surface>
      )}

      <Snackbar
        visible={message.visible}
        onDismiss={() => setMessage({ ...message, visible: false })}
        onIconPress={() => setMessage({ ...message, visible: false })}
      >
        {message.content}
      </Snackbar>
    </Surface>
  )
}

export default Settings
