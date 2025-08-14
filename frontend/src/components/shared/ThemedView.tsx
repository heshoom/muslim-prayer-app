import { View, type ViewProps } from 'react-native';

import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';

export type ThemedViewProps = ViewProps & {
  style?: ViewProps['style'];
  variant?: 'default' | 'surface';
};

//HELLO: This component is used to create a themed view that adapts to light and dark modes.
// It uses the useThemeColor hook to get the appropriate background color based on the current theme
// and applies it to the View component. Additional styles can be passed via the style prop.
// It can also accept lightColor and darkColor props to override the default theme colors.
// It is useful for creating consistent UI elements that respect the user's theme preference.
export function ThemedView({ style, variant = 'default', ...otherProps }: ThemedViewProps) {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const backgroundColor = variant === 'surface' ? theme.surface : theme.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
