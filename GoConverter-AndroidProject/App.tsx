import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import ConverterScreen from "./screens/ConverterScreen";
import SuccessScreen from "./screens/SuccessScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from "react-native";
import { initialize } from "react-native-google-mobile-ads";

// ignore non-critical warnings about expo dev client
LogBox.ignoreAllLogs(true);

// initialize AdMob (expo configured with app.json)
initialize();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Converter" component={ConverterScreen} />
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
