import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens (to be created)
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import StudentProfileScreen from './screens/StudentProfileScreen';
import GradesScreen from './screens/GradesScreen';
import AttendanceScreen from './screens/AttendanceScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Parent Dashboard' }}
          />
          <Stack.Screen 
            name="StudentProfile" 
            component={StudentProfileScreen}
            options={{ title: 'Student Profile' }}
          />
          <Stack.Screen 
            name="Grades" 
            component={GradesScreen}
            options={{ title: 'Grades & Reports' }}
          />
          <Stack.Screen 
            name="Attendance" 
            component={AttendanceScreen}
            options={{ title: 'Attendance' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
