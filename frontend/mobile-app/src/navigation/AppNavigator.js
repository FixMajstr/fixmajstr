import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import SearchScreen from "../screens/SearchScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterUserScreen from "../screens/RegisterUserScreen";
import RegisterMajstrScreen from "../screens/RegisterMajstrScreen";
import MajstrProfileScreen from "../screens/MajstrProfileScreen";
import RatingScreen from "../screens/RatingScreen";
import PovprasevanjeScreen from "../screens/PovprasevanjeScreen";
import InquirySuccessScreen from "../screens/InquirySuccessScreen";
import MyInquiriesScreen from "../screens/MyInquiriesScreen";
import ReceivedInquiriesScreen from "../screens/ReceivedInquiriesScreen";

import { ROUTES } from "./routes";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ROUTES.WELCOME}>
        <Stack.Screen
          name={ROUTES.WELCOME}
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.HOME}
          component={SearchScreen}
          options={{ title: "FixMajstr" }}
        />
        <Stack.Screen
          name={ROUTES.LOGIN}
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.REGISTER_USER}
          component={RegisterUserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.REGISTER_MAJSTR}
          component={RegisterMajstrScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name={ROUTES.MAJSTR_PROFILE} component={MajstrProfileScreen} />
        <Stack.Screen name={ROUTES.POVPRASEVANJE} component={PovprasevanjeScreen} />
        <Stack.Screen name={ROUTES.INQUIRY_SUCCESS} component={InquirySuccessScreen} />
        <Stack.Screen
          name={ROUTES.MY_INQUIRIES}
          component={MyInquiriesScreen}
          options={{ title: "PRETEKLA DELA" }}
        />
        <Stack.Screen
          name={ROUTES.RECEIVED_INQUIRIES}
          component={ReceivedInquiriesScreen}
          options={{ title: "PREJETA POVPRAŠEVANJA" }}
        />
        <Stack.Screen name={ROUTES.RATING} component={RatingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
