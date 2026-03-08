import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

const LoginPlaceholder = () => null;
const SearchPlaceholder = () => null;
const ProfilePlaceholder = () => null;
const InquiriesPlaceholder = () => null;
const RatingsPlaceholder = () => null;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginPlaceholder} />
        <Stack.Screen name="Search" component={SearchPlaceholder} />
        <Stack.Screen name="Profile" component={ProfilePlaceholder} />
        <Stack.Screen name="Inquiries" component={InquiriesPlaceholder} />
        <Stack.Screen name="Ratings" component={RatingsPlaceholder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
