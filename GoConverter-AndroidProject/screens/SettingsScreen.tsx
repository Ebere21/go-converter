import React from "react";
import { View, Text, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../styles";

export default function SettingsScreen() {
  async function clearHistory() {
    await AsyncStorage.removeItem("conversionHistory");
    Alert.alert("Cleared history");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Settings</Text>
      <Button title="Clear conversion history" onPress={clearHistory} />
      <View style={{ height: 12 }} />
      <Text style={styles.p}>Privacy: files are stored locally in the app cache and document directories. Delete via Settings → Clear conversion history or uninstall app.</Text>
    </View>
  );
}
