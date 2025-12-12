import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { BibleReaderScreen } from '../screens/BibleReaderScreen';
import { StudyRoomScreen } from '../screens/StudyRoomScreen';
import { VoiceCloneScreen } from '../screens/VoiceCloneScreen';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: Platform.OS === 'web' ? theme.navigationBar : 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 80,
            paddingBottom: 20,
          },
          tabBarBackground: () => (
             Platform.OS !== 'web' ? (
                <BlurView
                    tint={theme.isDark ? 'dark' : 'light'}
                    intensity={80}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
             ) : undefined
          ),
          tabBarActiveTintColor: theme.tabIconActive,
          tabBarInactiveTintColor: theme.tabIconInactive,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Bible') iconName = focused ? 'book' : 'book-outline';
            else if (route.name === 'Study') iconName = focused ? 'people' : 'people-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Study" component={StudyRoomScreen} />
        <Tab.Screen name="Bible" component={BibleReaderScreen} />
        <Tab.Screen name="Profile" component={VoiceCloneScreen} options={{ tabBarLabel: 'Voice Center' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
