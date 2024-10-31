import { Chip, Text } from 'react-native-paper'

import GradientBackground from '@/lib/ui/components/GradientBackground'

const ScreenInfo = (props: { title: string; path: string }) => (
  <>
    <GradientBackground />

    <Text variant="displaySmall">{props.title}</Text>

    <Text variant="bodyLarge">Open the screen code to edit it.</Text>

    <Chip textStyle={{ fontFamily: 'JetBrainsMono_400Regular' }}>
      {props.path}
    </Chip>

    <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
      Change the screen code to see updates.
    </Text>
  </>
)

export default ScreenInfo
