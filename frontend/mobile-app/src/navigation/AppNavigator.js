import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterUserScreen from '../screens/RegisterUserScreen';
import RegisterMajstrScreen from '../screens/RegisterMajstrScreen';
import MajstrProfileScreen from '../screens/MajstrProfileScreen';
import RatingScreen from '../screens/RatingScreen';

const Stack = createNativeStackNavigator();


const SearchPlaceholder = () => null;
const ProfilePlaceholder = () => null;
const InquiriesPlaceholder = () => null;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MajstrProfile">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterUser" component={RegisterUserScreen} />
        <Stack.Screen name="RegisterMajstr" component={RegisterMajstrScreen} />
        <Stack.Screen name="Search" component={SearchPlaceholder} />
        <Stack.Screen name="MajstrProfile" component={MajstrProfileScreen} />
        <Stack.Screen name="Profile" component={ProfilePlaceholder} />
        <Stack.Screen name="Inquiries" component={InquiriesPlaceholder} />
        <Stack.Screen name="RatingScreen" component={RatingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
