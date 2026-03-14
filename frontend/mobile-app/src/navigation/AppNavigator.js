import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterUserScreen from '../screens/RegisterUserScreen';
import RegisterMajstrScreen from '../screens/RegisterMajstrScreen';

const Stack = createNativeStackNavigator();


const SearchPlaceholder = () => null;
const ProfilePlaceholder = () => null;
const InquiriesPlaceholder = () => null;
const RatingsPlaceholder = () => null;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={LoginScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="RegisterUser" component={RegisterUserScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="RegisterMajstr" component={RegisterMajstrScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Search" component={SearchPlaceholder} />
        <Stack.Screen name="Profile" component={ProfilePlaceholder} />
        <Stack.Screen name="Inquiries" component={InquiriesPlaceholder} />
        <Stack.Screen name="Ratings" component={RatingsPlaceholder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
