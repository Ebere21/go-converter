import React from "react";
import { View, Text, Button, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useRoute, useNavigation } from "@react-navigation/native";
import AdBanner from "../ui/AdBanner";
import { styles } from "../styles";

export default function SuccessScreen() {
  const route: any = useRoute();
  const nav = useNavigation();
  const output: string = route.params?.output;
  const name: string = route.params?.name;

  async function shareFile() {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing is not available on this device");
      return;
    }
    await Sharing.shareAsync(output);
  }

  async function downloadToFiles() {
    const dest = FileSystem.documentDirectory + (name || "converted_file");
    try {
      await FileSystem.copyAsync({ from: output, to: dest });
      Alert.alert("Saved to app document directory: " + dest);
    } catch (e) {
      Alert.alert("Could not save file: " + e);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Conversion Complete</Text>
      <Text style={styles.p}>File ready: {name}</Text>

      <View style={{ height: 12 }} />
      <Button title="Share / Open" onPress={shareFile} />
      <View style={{ height: 8 }} />
      <Button title="Save locally" onPress={downloadToFiles} />
      <View style={{ height: 20 }} />
      <AdBanner />
      <View style={{ height: 30 }} />
      <Button title="Convert another file" onPress={() => (nav as any).navigate("Converter")} />
      <View style={{ height: 12 }} />
      <Button title="History" onPress={() => (nav as any).navigate("History")} />
    </View>
  );
}
