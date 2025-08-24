import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate, interpolateColor } from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  // Use all routes as tabs (assumes all state.routes are top-level tabs)
  const displayRoutes = React.useMemo(() => state.routes, [state.routes]);

  const tabWidth = useSharedValue(0);
  const position = useSharedValue(0);

  React.useEffect(() => {
    const activeName = state.routes[state.index]?.name;
    const idx = displayRoutes.findIndex((r: any) => r.name === activeName);
    position.value = withSpring(idx >= 0 ? idx : 0, { damping: 20, stiffness: 200 });
  }, [state.index, displayRoutes]);

  const onLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    tabWidth.value = w / Math.max(1, displayRoutes.length);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(position.value, [0, Math.max(0, displayRoutes.length - 1)], [0, tabWidth.value * (Math.max(0, displayRoutes.length - 1)) || 0]) },
    ],
  }));

  const handlePress = (route: any, idx: number) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) {
      if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      position.value = withSpring(idx, { damping: 20, stiffness: 200 });
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} onLayout={onLayout}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint={isDarkMode ? 'dark' : 'light'} style={{ flexDirection: 'row', paddingBottom: insets.bottom, height: 56 + insets.bottom }}>
            <TabContent displayRoutes={displayRoutes} descriptors={descriptors} onPress={handlePress} indicatorStyle={indicatorStyle} theme={theme} />
        </BlurView>
      ) : (
        <View style={{ flexDirection: 'row', backgroundColor: theme.tabBarBackground, paddingBottom: insets.bottom, height: 64 + insets.bottom }}>
            <TabContent displayRoutes={displayRoutes} descriptors={descriptors} onPress={handlePress} indicatorStyle={indicatorStyle} theme={theme} />
        </View>
      )}
    </View>
  );
}


function TabContent({ displayRoutes, descriptors, onPress, indicatorStyle, theme }: { displayRoutes: any[]; descriptors: any; onPress: (route: any, idx: number) => void; indicatorStyle: any; theme: any; }) {
  return (
    <View style={{ flex: 1, position: 'relative' }}>
  <Animated.View style={[{ position: 'absolute', top: 0, left: 0, height: 3, borderRadius: 2, backgroundColor: theme.tint }, indicatorStyle, { width: `${100 / Math.max(1, displayRoutes.length)}%` }]} />
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {displayRoutes.map((route: any, idx: number) => (
          <TabButton key={route.key} route={route} idx={idx} descriptors={descriptors} onPress={onPress} theme={theme} />
        ))}
      </View>
    </View>
  );
}

import { ThemedText } from '@/src/components/shared/ThemedText';

function TabButton({ route, idx, descriptors, onPress, theme }: { route: any; idx: number; descriptors: any; onPress: (route: any, idx: number) => void; theme: any; }) {
  const { options } = descriptors[route.key] || {};
  const label = options?.tabBarLabel ?? options?.title ?? route.name;
  const isFocused = descriptors[route.key]?.navigation?.isFocused?.() ?? false;

  return (
    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => onPress(route, idx)} activeOpacity={0.8}>
      {options?.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: isFocused ? theme.tabIconSelected : theme.tabIconDefault, size: 22 }) : null}
      <View style={{ height: 1 }} />
      <ThemedText style={{ fontSize: 11, color: isFocused ? theme.tabIconSelected : theme.tabIconDefault, marginTop: 0 }}>{label}</ThemedText>
    </TouchableOpacity>
  );
}
