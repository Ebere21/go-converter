import React, { useState } from "react";
import { View, Text, Button, Image, Alert, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { styles } from "../styles";
import { showInterstitialIfNeeded } from "../utils/ads";
import { SERVER_URL } from "../config";

export default function ConverterScreen() {
  const [picked, setPicked] = useState<any>(null);
  const [targetFormat, setTargetFormat] = useState<string | null>(null);
  const nav = useNavigation();
  const route: any = useRoute();
  const category = route.params?.category || "image";

  async function pickFile() {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.type === "success") {
      setPicked(res);
      // default target for images
      if (res.mimeType?.startsWith("image")) setTargetFormat("jpeg");
    }
  }

  async function doImageConversion(uri: string, format: string) {
    const manipResult = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.9, format: format as any });
    const dest = FileSystem.cacheDirectory + "converted_" + Date.now() + "." + (format === "jpeg" ? "jpg" : format);
    await FileSystem.copyAsync({ from: manipResult.uri, to: dest });
    return dest;
  }

  async function convert() {
    if (!picked) {
      Alert.alert("Pick a file first");
      return;
    }

    try {
      let outUri = picked.uri;

      if (category === "image" && targetFormat) {
        outUri = await doImageConversion(picked.uri, targetFormat);

        const historyStr = await AsyncStorage.getItem("conversionHistory");
        const history = historyStr ? JSON.parse(historyStr) : [];
        const item = {
          id: Date.now().toString(),
          name: picked.name,
          original: picked.uri,
          output: outUri,
          format: targetFormat || picked.mimeType,
          date: new Date().toISOString(),
        };
        history.unshift(item);
        await AsyncStorage.setItem("conversionHistory", JSON.stringify(history.slice(0, 50)));

        await showInterstitialIfNeeded();
        (nav as any).navigate("Success", { output: outUri, name: picked.name });
        return;
      }

      // For other categories call remote server
      const uri = picked.uri;
      const fileName = picked.name || ("file_" + Date.now());
      const ext = fileName.split(".").pop();

      const form = new FormData();
      // @ts-ignore
      form.append("file", { uri, name: fileName, type: picked.mimeType || "application/octet-stream" });
      form.append("targetFormat", (targetFormat || ext || "").toLowerCase());
      form.append("keep", "false");

      const res = await fetch(`${SERVER_URL}/convert`, {
        method: "POST",
        body: form as any,
        headers: {
          "Accept": "*/*",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        Alert.alert("Conversion failed", txt);
        return;
      }

      const arrayBuffer = await res.arrayBuffer();
      const outExt = (targetFormat || ext || "bin");
      const outPath = FileSystem.cacheDirectory + `converted_${Date.now()}.${outExt}`;
      const b64 = Buffer.from(arrayBuffer).toString("base64");
      await FileSystem.writeAsStringAsync(outPath, b64, { encoding: FileSystem.EncodingType.Base64 });

      const historyStr = await AsyncStorage.getItem("conversionHistory");
      const history = historyStr ? JSON.parse(historyStr) : [];
      const item = {
        id: Date.now().toString(),
        name: picked.name,
        original: picked.uri,
        output: outPath,
        format: targetFormat || picked.mimeType,
        date: new Date().toISOString(),
      };
      history.unshift(item);
      await AsyncStorage.setItem("conversionHistory", JSON.stringify(history.slice(0, 50)));

      await showInterstitialIfNeeded();
      (nav as any).navigate("Success", { output: outPath, name: picked.name });

    } catch (e) {
      Alert.alert("Conversion failed", String(e));
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.h1}>Convert {category}</Text>
        <Button title="Pick file" onPress={pickFile} />
        {picked && (
          <>
            <Text style={styles.p}>Selected: {picked.name}</Text>
            {picked.mimeType?.startsWith("image") && <Image source={{ uri: picked.uri }} style={{ width: 200, height: 200, marginTop: 12, borderRadius: 12 }} />}
            <View style={{ height: 12 }} />
            {category === "image" && (
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                <Button title="To JPG" onPress={() => setTargetFormat("jpeg")} />
                <Button title="To PNG" onPress={() => setTargetFormat("png")} />
                <Button title="To WEBP" onPress={() => setTargetFormat("webp")} />
              </View>
            )}
            <Button title="Convert" onPress={convert} />
            <View style={{ height: 40 }} />
            <Text style={styles.small}>Note: Images convert on-device. For video/audio/document conversions the app will use a secure temporary server.</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
