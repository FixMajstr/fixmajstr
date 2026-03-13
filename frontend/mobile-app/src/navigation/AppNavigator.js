import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterUserScreen from "../screens/RegisterUserScreen";
import RegisterMajstrScreen from "../screens/RegisterMajstrScreen";
import MajstrProfileScreen from "../screens/MajstrProfileScreen";
import RatingScreen from "../screens/RatingScreen";
import PovprasevanjeScreen from "../screens/PovprasevanjeScreen";
import InquirySuccessScreen from "../screens/InquirySuccessScreen";
import MyInquiriesScreen from "../screens/MyInquiriesScreen";
import ReceivedInquiriesScreen from "../screens/ReceivedInquiriesScreen";

const Stack = createNativeStackNavigator();

const SearchPlaceholder = () => null;
const ProfilePlaceholder = () => null;
const RatingsPlaceholder = () => null;

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
        <Stack.Screen name="Povprasevanje" component={PovprasevanjeScreen} />
        <Stack.Screen name="InquirySuccess" component={InquirySuccessScreen} />
        <Stack.Screen name="MyInquiries" component={MyInquiriesScreen} />
        <Stack.Screen name="ReceivedInquiries" component={ReceivedInquiriesScreen} />
        <Stack.Screen name="RatingScreen" component={RatingScreen} />
        <Stack.Screen name="Ratings" component={RatingsPlaceholder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
