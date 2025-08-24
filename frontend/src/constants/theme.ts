export const lightTheme = {
  background: '#f0f4f8',
  surface: '#ffffff',
  primary: '#2980b9',
  secondary: '#27ae60',
  tint: '#2980b9',
  tabBarBackground: 'rgba(255, 255, 255, 0.9)',
  tabIconDefault: '#7f8c8d', // Medium grey instead of dark grey for better icon visibility
  tabIconSelected: '#2980b9',
  text: {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    inverse: '#ffffff',
  },
  border: '#dce4ec',
  error: '#e74c3c',
  success: '#2ecc71',
  card: {
    background: '#ffffff',
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};

export const darkTheme = {
  background: '#121212', // Darker background
  surface: '#1e1e1e', // Slightly lighter than background
  input: '#333333', // Dark grey for input boxes
  primary: '#3498db',
  tint: '#3498db',
  tabBarBackground: 'rgba(30, 30, 30, 0.9)',
  tabIconDefault: '#a0a0a0', // Light grey instead of pure white for better icon visibility
  tabIconSelected: '#3498db',
  secondary: '#2ecc71',
  text: {
    primary: '#ffffff', // Pure white for primary text
    secondary: '#a0a0a0', // Light grey for secondary text
    inverse: '#2c3e50',
  },
  border: '#404040',
  error: '#e74c3c',
  success: '#2ecc71',
  card: {
    background: '#1e1e1e',
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};
