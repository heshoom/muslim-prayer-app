import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/src/utils/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  style?: ViewProps['style'];
  // Additional props can be added here if needed
};

//HELLO: This component is used to create a themed view that adapts to light and dark modes.
// It uses the useThemeColor hook to get the appropriate background color based on the current theme
// and applies it to the View component. Additional styles can be passed via the style prop.
// It can also accept lightColor and darkColor props to override the default theme colors.
// It is useful for creating consistent UI elements that respect the user's theme preference.
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
