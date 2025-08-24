import React, { useState, useEffect } from 'react';
import FacebookStyleTransition from '@/src/components/shared/FacebookStyleTransition';
import { StyleSheet, View, FlatList, Share, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardTextButton } from '@/src/components/shared/ClipboardTextButton';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { DUA_SECTIONS, DuaSection, DuaCategory, DuaItem } from '@/src/data/dua';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

export default function DuaScreen() {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  // Track expanded category - only one can be expanded at a time
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Reset expanded state when leaving the page
  useFocusEffect(
    React.useCallback(() => {
      // Reset when entering the page
      setExpandedCategory(null);
      
      return () => {
        // Reset when leaving the page
        setExpandedCategory(null);
      };
    }, [])
  );

  const onShare = async (item: { titleKey: string; text: string }) => {
    try {
      await Share.share({
        message: `${t(item.titleKey)}\n\n${item.text}`,
      });
    } catch {}
  };

  // Vector icon components
  const renderIcon = (icon: string) => {
    const iconColor = theme.text.primary;
    const size = 28;
    
    const iconMap: Record<string, React.ReactNode> = {
      bed: (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path fillRule="evenodd" clipRule="evenodd" d="M3 4C3 3.44772 2.55228 3 2 3C1.44772 3 1 3.44772 1 4V14V17V20C1 20.5523 1.44772 21 2 21C2.55228 21 3 20.5523 3 20V18H21V20C21 20.5523 21.4477 21 22 21C22.5523 21 23 20.5523 23 20V17V14V11C23 8.23858 20.7614 6 18 6H12C11.4477 6 11 6.44772 11 7V9.5C11 7.567 9.433 6 7.5 6C5.567 6 4 7.567 4 9.5C4 11.433 5.567 13 7.5 13H3V4ZM7.5 13C9.433 13 11 11.433 11 9.5V13H7.5ZM21 15V16H3V15H12H21ZM21 11V13H13V8H18C19.6569 8 21 9.34315 21 11ZM6 9.5C6 8.67157 6.67157 8 7.5 8C8.32843 8 9 8.67157 9 9.5C9 10.3284 8.32843 11 7.5 11C6.67157 11 6 10.3284 6 9.5Z" fill={iconColor}/>
        </Svg>
      ),
      toilet: (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M21,9H9V3A2,2,0,0,0,7,1H3A2,2,0,0,0,1,3V9a5.006,5.006,0,0,0,5,5H7.073A7.061,7.061,0,0,0,11,19.319l-.925,2.31A1,1,0,0,0,11,23h8a1,1,0,0,0,.929-1.371L19,19.319A7.045,7.045,0,0,0,23,13V11A2,2,0,0,0,21,9Zm0,2v1H9V11ZM3,9V3H7v9H6A3,3,0,0,1,3,9Zm14.417,8.793a1,1,0,0,0-.645,1.33L17.523,21H12.477l.751-1.877a1,1,0,0,0-.645-1.33A5.034,5.034,0,0,1,9.1,14H20.9A5.034,5.034,0,0,1,17.417,17.793Z" fill={iconColor}/>
        </Svg>
      ),
      water: (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <Path d="M32,10H21V6h5a2,2,0,0,0,0-4H12a2,2,0,0,0,0,4h5v4H9a2.9,2.9,0,0,0-3,3v8a2.9,2.9,0,0,0,3,3H28v7a2.9,2.9,0,0,0,3,3h8a2.9,2.9,0,0,0,3-3V20A10,10,0,0,0,32,10Zm6,20H32V23a2.9,2.9,0,0,0-3-3H10V14H32a6,6,0,0,1,6,6Z" fill={iconColor}/>
          <Path d="M35,36l-3,3.4a3.9,3.9,0,0,0,.4,5.6,4,4,0,0,0,5.2,0,3.9,3.9,0,0,0,.4-5.6Z" fill={iconColor}/>
        </Svg>
      ),
      mosque: (
        <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
          <Path d="M490.305,221.83h-36.324c-5.44-51.155-53.174-93.042-114.455-101.488v-20.003c0-11.932-9.763-21.695-21.695-21.695s-21.695,9.763-21.695,21.695v19.713c-62.322,7.745-111.121,50.021-116.625,101.778h-12.46V82.983c0-5.424-2.169-10.847-6.508-15.186L98.712,7.051c-8.678-8.678-21.695-8.678-30.373,0L6.508,68.881C2.169,73.22,0,78.644,0,84.068v405.695c0,11.932,9.763,21.695,21.695,21.695h123.661h117.153h110.644h117.153c11.932,0,20.61-8.678,21.695-20.61V243.525C512,231.593,502.237,221.83,490.305,221.83z M317.831,161.085c47.649,0,88.023,26.346,94.534,60.746H223.275C229.639,187.431,269.189,161.085,317.831,161.085z M43.39,92.746L83.525,52.61l41.22,40.136v144.037c-0.7,2.125-1.085,4.39-1.085,6.742v225.627H43.39V92.746z M285.288,469.152V366.102l33.627-20.61l33.627,20.61v103.051H285.288z M468.61,469.152h-73.763V354.169c0-7.593-4.339-14.102-10.847-18.441l-55.322-32.542c-6.508-4.339-15.186-4.339-21.695,0l-55.322,32.542c-6.508,4.339-10.847,10.847-10.847,18.441v114.983h-73.763V265.22H468.61V469.152z" fill={iconColor}/>
        </Svg>
      ),
      pray: (
        <Svg width={size} height={size} viewBox="0 0 487.617 487.617" fill="none">
          <Path d="M180.069,178.503c2.136-0.961,3.092-3.47,2.136-5.609c-0.957-2.142-3.471-3.103-5.614-2.146c-1.823,0.815-44.765,20.772-54.005,91.919c-0.302,2.328,1.34,4.459,3.668,4.762c0.186,0.024,0.37,0.036,0.553,0.036c2.104,0,3.931-1.561,4.21-3.703c4.496-34.621,17.6-55.956,27.8-67.758C169.798,183.297,179.876,178.592,180.069,178.503z" fill={iconColor}/>
          <Path d="M334.908,356.742c-3.684-2.011-7.763-3.933-12.081-5.966c-14.645-6.898-31.124-14.669-42.76-30.335l80.079-67.695c4.798-4.04,7.737-9.707,8.273-15.956c0.405-4.723-0.599-9.349-2.856-13.399c3.282-3.752,5.466-8.514,6.094-13.54c0.819-6.564-0.955-12.822-4.994-17.619l-8.258-9.809c-4.04-4.798-9.706-7.736-15.956-8.273c-6.245-0.537-12.333,1.393-17.162,5.458l-69.233,59.401c-0.222-6.752-0.691-14.658-1.622-22.791c-2.526-22.083-7.525-37.544-14.906-46.21c8.66-1.594,17.042-4.778,24.778-9.512c16.542-10.123,28.152-26.083,32.691-44.938c5.838-24.251-1.383-50.12-18.844-67.908l-4.29-35.874C273.059,5.063,267.359,0,260.604,0c-0.531,0-1.069,0.032-1.599,0.096l-90.498,10.823c-7.316,0.877-12.556,7.541-11.681,14.856l4.785,40.019c-2.523,5-4.476,10.299-5.795,15.781c-6.061,25.175,1.871,50.492,18.751,67.779c-5.607,3.372-15.496,10.271-26.029,22.085c-14.439,16.195-32.908,45.167-38.889,91.227c-4.356,33.533-6.55,82.092-1.075,109.468l0.277,1.39c3.278,16.479,7.452,37.429,32.424,46.139c-9.828,2.833-19.816,7.37-27.312,14.631c-8.123,7.868-12.241,17.847-12.241,29.659v19.414c0,1.129,0.449,2.211,1.248,3.008c0.797,0.796,1.877,1.242,3.002,1.242c0.003,0,0.005,0,0.008,0l207.658-0.377c20.713,0,38.17-4.446,50.485-12.856c14.243-9.728,21.772-24.872,21.772-43.794C385.895,390.615,374.41,378.307,334.908,356.742z M359.951,236.063c-0.342,3.987-2.217,7.603-5.285,10.186l-90.994,76.923c-2.697,2.272-6.12,3.523-9.639,3.522c-4.437,0-8.617-1.944-11.471-5.333l-74.356-88.317c-2.577-3.061-3.808-6.943-3.466-10.93c0.256-2.982,1.37-5.755,3.196-8.043l39.989,49.888c0.839,1.047,2.073,1.592,3.318,1.592c0.933,0,1.872-0.305,2.656-0.934c1.831-1.468,2.126-4.143,0.658-5.974l-40.301-50.277l5.57-4.69c2.697-2.271,6.121-3.521,9.64-3.521c4.437,0,8.617,1.944,11.471,5.333l53.556,63.613c0.726,0.862,1.765,1.401,2.888,1.497c1.125,0.096,2.239-0.258,3.101-0.983l66.634-56.101c2.697-2.271,6.121-3.522,9.64-3.522c4.436,0,8.617,1.944,11.47,5.333l8.259,9.81C359.062,228.194,360.293,232.076,359.951,236.063z M330.793,186.086c3.061-2.577,6.944-3.807,10.93-3.466c3.987,0.342,7.602,2.217,10.18,5.278l8.258,9.809c2.497,2.965,3.584,6.904,3.062,11.092c-0.344,2.76-1.392,5.392-2.96,7.624l-5.535-6.574c-4.472-5.312-11.023-8.358-17.972-8.358c-5.519,0-10.887,1.96-15.114,5.52l-63.383,53.364l-2.14-2.542c0.044-1.393,0.109-4.107,0.112-7.773L330.793,186.086z M169.517,19.358l90.497-10.823c0.198-0.023,0.395-0.035,0.589-0.035c2.455,0,4.526,1.843,4.819,4.288l3.976,33.255l-99.718,15.646l-1.411-11.797l32.865-4.449c2.326-0.314,3.957-2.456,3.642-4.781c-0.314-2.326-2.456-3.959-4.781-3.642l-32.735,4.431l-1.995-16.685C164.947,22.103,166.855,19.678,169.517,19.358z M164.079,83.564c1.095-4.548,2.678-8.956,4.712-13.132l103.826-16.29c15.042,15.689,21.211,38.26,16.115,59.429c-4.008,16.648-14.258,30.739-28.864,39.677c-14.606,8.938-31.818,11.653-48.466,7.645C177.035,152.62,155.806,117.93,164.079,83.564z M167.895,415.14c-41,2.112-46.5-22.123-50.707-43.275l-0.279-1.398c-5.286-26.432-3.1-73.842,1.169-106.706c5.67-43.66,22.972-71.033,36.488-86.308c11.661-13.179,22.588-19.88,26.629-22.098c8.043,6.423,17.568,11.239,28.218,13.803c5.684,1.369,11.426,2.045,17.127,2.045c0.302,0,0.604-0.012,0.906-0.016c16.552,6.876,20.211,50.9,20.319,76.723l-40.325-47.898c-4.473-5.312-11.023-8.358-17.973-8.358c-5.519,0-10.887,1.96-15.114,5.52l-9.808,8.258c-4.798,4.04-7.736,9.706-8.273,15.955c-0.536,6.249,1.393,12.333,5.433,17.131l74.355,88.317c4.472,5.313,11.022,8.359,17.973,8.359c0.001,0,0.001,0,0.001,0c5.519,0,10.887-1.96,15.12-5.525l4.411-3.729c12.914,17.105,30.953,25.606,45.642,32.526c4.2,1.978,8.167,3.847,11.629,5.738c7.553,4.123,13.911,7.82,19.267,11.347h-13.361c-2.347,0-4.25,1.903-4.25,4.25c0,2.347,1.903,4.25,4.25,4.25h24.631c3.26,2.918,5.885,5.868,7.997,9h-38.128c-2.347,0-4.25,1.903-4.25,4.25c0,2.347,1.903,4.25,4.25,4.25h42.468c2.82,7.67,3.685,16.819,3.685,29.04c0,41.895-39.945,48.15-63.764,48.15l-203.408,0.369V464.05h42.519c2.347,0,4.25-1.903,4.25-4.25c0-2.347-1.903-4.25-4.25-4.25h-41.593c1.365-5.809,4.251-10.807,8.716-15.137c13.181-12.783,36.589-16.067,48.982-16.779c64.425-3.698,85.376-1.602,91.316-0.632c1.738,0.283,3.239,0.528,5.246,0.528c2.347,0,4.25-1.903,4.25-4.25c0-2.347-1.903-4.25-4.25-4.25c-1.318,0-2.281-0.157-3.877-0.417C254.823,413.518,233.095,411.595,167.895,415.14z" fill={iconColor}/>
          <Path d="M224.241,455.55h-49c-2.347,0-4.25,1.903-4.25,4.25c0,2.347,1.903,4.25,4.25,4.25h49c2.347,0,4.25-1.903,4.25-4.25C228.491,457.453,226.588,455.55,224.241,455.55z" fill={iconColor}/>
        </Svg>
      ),
      home: (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={iconColor} strokeWidth="2" fill="none"/>
          <Path d="M9 22V12h6v10" stroke={iconColor} strokeWidth="2" fill="none"/>
        </Svg>
      ),
      Garment: (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <Path d="M45.2,12.9,37.1,4H10.9L2.8,12.9a3,3,0,0,0,.1,4.2l7.5,7.5V44H37.7V24.6l7.5-7.5A3,3,0,0,0,45.2,12.9Zm-8.4,6.8-3.1-2.9V40H14.3V16.8l-3.1,2.9L6.4,14.9,12.7,8h7.4a4,4,0,0,0,7.8,0h7.4l6.3,6.9Z" fill={iconColor}/>
        </Svg>
      ),
      Travel: (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path fillRule="evenodd" clipRule="evenodd" d="M18.8286 1.72758C19.618 1.37176 21.0449 0.981099 22.1457 2.08172C23.2466 3.18244 22.8558 4.60949 22.5 5.39885C22.2409 5.97353 21.8851 6.58498 21.4343 7.03586L18.3035 10.1667L20.75 19.9527C21.0686 21.2273 19.4017 22.0136 18.6208 20.957L13.9001 14.5701L11.0678 17.4024L10.4818 21.504C10.326 22.5944 8.90642 22.9164 8.29541 21.9999L5.86325 18.3517L1.89476 15.6042C0.960857 14.9577 1.36456 13.4958 2.49799 13.4203L6.85509 13.1298L9.65741 10.3275L3.27054 5.60674C2.21395 4.82579 3.00021 3.1589 4.27485 3.47756L14.0608 5.92406L17.1916 2.7933C17.6424 2.34244 18.254 1.98663 18.8286 1.72758ZM18.5828 4.23053L15.1548 7.65856C14.8567 7.95662 14.4241 8.07643 14.0152 7.9742L7.70352 6.39628L11.5932 9.27129C12.1832 9.70735 12.2473 10.5661 11.7285 11.0848L8.05676 14.7566C7.85123 14.9621 7.57808 15.086 7.28807 15.1054L4.91621 15.2635L7.31557 16.9246L8.79804 19.1483L9.12556 16.8556C9.16228 16.5986 9.28139 16.3604 9.46498 16.1768L13.1427 12.499C13.6615 11.9803 14.5202 12.0443 14.9562 12.6343L17.8312 16.524L16.2533 10.2123C16.1511 9.80342 16.2709 9.37083 16.569 9.07277L19.997 5.64474C20.0811 5.54456 20.4407 5.10051 20.6767 4.57691C20.9648 3.93787 20.8835 3.64788 20.7316 3.49604C20.5796 3.34411 20.2895 3.26286 19.6505 3.5509C19.127 3.78691 18.683 4.14648 18.5828 4.23053Z" fill={iconColor}/>
        </Svg>
      ),
      Food: (
        <Svg width={size} height={size} viewBox="0 0 1024 1024" fill="none">
          <Path d="M128 352.576V352a288 288 0 0 1 491.072-204.224 192 192 0 0 1 274.24 204.48 64 64 0 0 1 57.216 74.24C921.6 600.512 850.048 710.656 736 756.992V800a96 96 0 0 1-96 96H384a96 96 0 0 1-96-96v-43.008c-114.048-46.336-185.6-156.48-214.528-330.496A64 64 0 0 1 128 352.64zm64-.576h64a160 160 0 0 1 320 0h64a224 224 0 0 0-448 0zm128 0h192a96 96 0 0 0-192 0zm439.424 0h68.544A128.256 128.256 0 0 0 704 192c-15.36 0-29.952 2.688-43.52 7.616 11.328 18.176 20.672 37.76 27.84 58.304A64.128 64.128 0 0 1 759.424 352zM672 768H352v32a32 32 0 0 0 32 32h256a32 32 0 0 0 32-32v-32zm-342.528-64h365.056c101.504-32.64 165.76-124.928 192.896-288H136.576c27.136 163.072 91.392 255.36 192.896 288z" fill={iconColor}/>
        </Svg>
      ),
      beads: (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2" fill="none"/>
          <Circle cx="12" cy="12" r="3" fill={iconColor}/>
          <Path d="M12 2v4" stroke={iconColor} strokeWidth="2"/>
          <Path d="M12 18v4" stroke={iconColor} strokeWidth="2"/>
          <Path d="M2 12h4" stroke={iconColor} strokeWidth="2"/>
          <Path d="M18 12h4" stroke={iconColor} strokeWidth="2"/>
        </Svg>
      ),

    };
    
    return iconMap[icon] || (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2" fill="none"/>
        <Path d="M12 8v8" stroke={iconColor} strokeWidth="2"/>
        <Path d="M8 12h8" stroke={iconColor} strokeWidth="2"/>
      </Svg>
    );
  };

  // Handle category expansion - only one can be expanded at a time
  const handleCategoryToggle = (categoryKey: string) => {
    if (expandedCategory === categoryKey) {
      // If clicking the same category, collapse it
      setExpandedCategory(null);
    } else {
      // If clicking a different category, expand it and collapse others
      setExpandedCategory(categoryKey);
    }
  };

  // Animated category component
  const AnimatedCategory = ({ cat }: { cat: DuaCategory }) => {
    const isExpanded = expandedCategory === cat.key;
    const animatedHeight = useSharedValue(0);
    const animatedOpacity = useSharedValue(0);
    const animatedScale = useSharedValue(0.95);
    const animatedRotation = useSharedValue(0);

    // Animate when expansion state changes
    React.useEffect(() => {
      if (isExpanded) {
        // Expand animation - smooth and natural
        animatedHeight.value = withSpring(1, { 
          damping: 20, 
          stiffness: 200,
          mass: 0.8
        });
        animatedOpacity.value = withTiming(1, { 
          duration: 400 
        });
        animatedScale.value = withSpring(1, { 
          damping: 20, 
          stiffness: 200,
          mass: 0.8
        });
        animatedRotation.value = withSpring(180, { 
          damping: 20, 
          stiffness: 200,
          mass: 0.8
        });
      } else {
        // Collapse animation - equally smooth
        animatedHeight.value = withSpring(0, { 
          damping: 20, 
          stiffness: 200,
          mass: 0.8
        });
        animatedOpacity.value = withTiming(0, { 
          duration: 300 
        });
        animatedScale.value = withSpring(0.95, { 
          damping: 20, 
          stiffness: 200,
          mass: 0.8
        });
        animatedRotation.value = withSpring(0, { 
          damping: 20, 
          stiffness: 200,
          mass: 0.8
        });
      }
    }, [isExpanded]);

    const contentAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: animatedOpacity.value,
        transform: [{ scale: animatedScale.value }],
      };
    });

    const containerAnimatedStyle = useAnimatedStyle(() => {
      return {
        maxHeight: interpolate(
          animatedHeight.value,
          [0, 1],
          [0, 200], // Reduced height for compact design
          Extrapolate.CLAMP
        ),
        overflow: 'hidden',
      };
    });

    const chevronAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotate: `${animatedRotation.value}deg` }],
      };
    });

  return (
      <View key={cat.key} style={styles.categoryContainer}>
                    <TouchableOpacity
                      style={[
                        styles.categoryRow,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isExpanded ? 0.1 : 0.05,
              shadowRadius: isExpanded ? 6 : 3,
              elevation: isExpanded ? 6 : 3,
                        },
                      ]}
          onPress={() => handleCategoryToggle(cat.key)}
          activeOpacity={0.8}
                    >
                      <View style={styles.categoryIconLabel}>
            <View style={[
              styles.iconContainer,
              { 
                backgroundColor: isExpanded ? theme.primary + '15' : theme.background + '40',
                borderColor: isExpanded ? theme.primary + '30' : theme.border
              }
            ]}>
                        {renderIcon(cat.icon)}
            </View>
            <ThemedText style={[
              styles.categoryLabel, 
              { 
                color: theme.text.primary,
                fontWeight: isExpanded ? '600' : '500'
              }
            ]}>
              {t(cat.labelKey)}
            </ThemedText>
                      </View>
          <Animated.View style={[styles.chevronContainer, chevronAnimatedStyle]}>
            <ThemedText style={[
              styles.chevron, 
              { 
                color: isExpanded ? theme.primary : theme.text.secondary,
                fontWeight: '600'
              }
            ]}>
              ▼
            </ThemedText>
          </Animated.View>
                    </TouchableOpacity>
        
        <Animated.View style={[containerAnimatedStyle]}>
          <Animated.View style={[contentAnimatedStyle]}>
            {cat.items.length > 0 && (
                      <View style={[styles.duaList, { backgroundColor: theme.background }]}> 
                {cat.items.map((item, index) => (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.duaOption,
                              {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                        marginBottom: index === cat.items.length - 1 ? 0 : 6,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.04,
                        shadowRadius: 2,
                        elevation: 1,
                              },
                            ]}
                            onPress={() => router.push({ pathname: '/dua-detail', params: { id: item.id } })}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={[
                      styles.duaOptionText, 
                      { 
                        color: theme.text.primary,
                        fontWeight: '500'
                      }
                    ]}>
                      {t(item.titleKey)}
                    </ThemedText>
                    <ThemedText style={[
                      styles.duaOptionArrow, 
                      { color: theme.text.secondary }
                    ]}>
                      ›
                    </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
          </Animated.View>
        </Animated.View>
                  </View>
                );
  };

  return (
    <FacebookStyleTransition direction="right">
      <ThemedView style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top + 10 }]}> 
        <FlatList
          data={DUA_SECTIONS}
          keyExtractor={(section) => section.key}
          contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: section }) => (
            <View style={styles.section}>
              <ThemedText style={[
                styles.sectionHeader, 
                { 
                  color: theme.primary,
                  marginBottom: 16,
                  marginLeft: 2
                }
              ]}>
                {t(section.labelKey)}
              </ThemedText>
              {section.categories.map((cat) => (
                <AnimatedCategory key={cat.key} cat={cat} />
              ))}
            </View>
          )}
        />
      </ThemedView>
    </FacebookStyleTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: '700', marginLeft: 16, marginBottom: 8 },
  section: { marginBottom: 24 },
  sectionHeader: { 
    fontSize: 20, 
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  categoryContainer: { marginBottom: 12 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  categoryIconLabel: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { 
    fontSize: 24,
  },
  categoryLabel: { 
    fontSize: 16,
    letterSpacing: -0.2,
    flex: 1,
  },
  chevronContainer: { 
    justifyContent: 'center', 
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  chevron: { 
    fontSize: 14,
  },
  duaList: { 
    paddingTop: 12,
    paddingHorizontal: 2,
  },
  duaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 52,
  },
  duaOptionText: { 
    fontSize: 15,
    flex: 1,
    letterSpacing: -0.1,
  },
  duaOptionArrow: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: { padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  note: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  arabic: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  text: { fontSize: 14, marginBottom: 2 },
  actions: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  shareButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, marginLeft: 8 },
  shareText: { fontSize: 14, fontWeight: '600' },
});
