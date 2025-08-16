import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
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
  
  const tabWidth = useSharedValue(0);
  const tabOffset = useSharedValue(state.index);

  // Sync indicator with current tab state
  React.useEffect(() => {
    tabOffset.value = withSpring(state.index, {
      damping: 25,
      stiffness: 300,
      mass: 0.8,
    });
  }, [state.index]);

  const onTabPress = (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      // Add haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Animate to new tab position with improved spring animation
      tabOffset.value = withSpring(index, {
        damping: 25,
        stiffness: 300,
        mass: 0.8,
      });
      
      navigation.navigate(route.name);
    }
  };

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            tabOffset.value,
            [0, state.routes.length - 1],
            [0, tabWidth.value * (state.routes.length - 1) || 0]
          ),
        },
      ],
    };
  });

  const onLayout = (event: any) => {
    const totalWidth = event.nativeEvent.layout.width;
    tabWidth.value = totalWidth / state.routes.length;
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 0,
        backgroundColor: 'transparent',
      }}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={100}
          tint={isDarkMode ? 'systemMaterialDark' : 'systemMaterialLight'}
          style={{
            flexDirection: 'row',
            height: 42 + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom,
            backgroundColor: 'transparent',
          }}
          onLayout={onLayout}
        >
          <TabContent
            state={state}
            descriptors={descriptors}
            onTabPress={onTabPress}
            theme={theme}
            indicatorStyle={indicatorStyle}
            tabWidth={tabWidth}
          />
        </BlurView>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            height: 65 + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom,
            backgroundColor: theme.tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: theme.border || 'rgba(0,0,0,0.1)',
          }}
          onLayout={onLayout}
        >
          <TabContent
            state={state}
            descriptors={descriptors}
            onTabPress={onTabPress}
            theme={theme}
            indicatorStyle={indicatorStyle}
            tabWidth={tabWidth}
          />
        </View>
      )}
    </View>
  );
}

function TabContent({ 
  state, 
  descriptors, 
  onTabPress, 
  theme, 
  indicatorStyle, 
  tabWidth 
}: {
  state: any;
  descriptors: any;
  onTabPress: (route: any, index: number) => void;
  theme: any;
  indicatorStyle: any;
  tabWidth: any;
}) {
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* Animated indicator */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            height: 3,
            backgroundColor: theme.tint,
            borderRadius: 1.5,
          },
          indicatorStyle,
          {
            width: `${100 / state.routes.length}%`,
          },
        ]}
      />
      
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const animatedScale = useSharedValue(isFocused ? 1 : 0.9);
        const animatedOpacity = useSharedValue(isFocused ? 1 : 0.6);
        const animatedBackgroundOpacity = useSharedValue(isFocused ? 0.15 : 0);

        React.useEffect(() => {
          animatedScale.value = withSpring(isFocused ? 1.05 : 0.95, {
            damping: 20,
            stiffness: 300,
          });
          animatedOpacity.value = withSpring(isFocused ? 1 : 0.6, {
            damping: 15,
            stiffness: 200,
          });
          animatedBackgroundOpacity.value = withSpring(isFocused ? 0.15 : 0, {
            damping: 15,
            stiffness: 200,
          });
        }, [isFocused]);

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: animatedScale.value }],
          opacity: animatedOpacity.value,
        }));

        const backgroundAnimatedStyle = useAnimatedStyle(() => ({
          backgroundColor: interpolateColor(
            animatedBackgroundOpacity.value,
            [0, 0.15],
            ['transparent', theme.tint + '26'] // Adding alpha for transparency
          ),
        }));

        return (
          <AnimatedTouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={() => onTabPress(route, index)}
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 2,
                minHeight: 50,
                borderRadius: 8,
                marginHorizontal: 2,
              },
              backgroundAnimatedStyle,
            ]}
            activeOpacity={0.7}
          >
            {options.tabBarIcon && (
              <Animated.View style={animatedStyle}>
                {options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? theme.tint : theme.tabIconDefault,
                  size: 24,
                })}
              </Animated.View>
            )}
            
            <Animated.Text
              style={[
                {
                  fontSize: 10,
                  marginTop: 1,
                  color: isFocused ? theme.tint : theme.tabIconDefault,
                  fontWeight: isFocused ? '600' : '400',
                },
                animatedStyle,
              ]}
            >
              {label}
            </Animated.Text>
          </AnimatedTouchableOpacity>
        );
      })}
      </View>
    </View>
  );
}
