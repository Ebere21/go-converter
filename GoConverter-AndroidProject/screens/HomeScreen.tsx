import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CategoryCard from "../ui/CategoryCard";
import AdBanner from "../ui/AdBanner";
import { styles } from "../styles";

export default function HomeScreen() {
  const nav = useNavigation();

  const categories = [
    { id: "image", title: "Images", subtitle: "JPG, PNG, WEBP", colors: ["#2EC8C8", "#A06BFF"] },
    { id: "document", title: "Documents", subtitle: "PDF, DOCX, TXT", colors: ["#FF9F4A", "#4D9EFF"] },
    { id: "audio", title: "Audio", subtitle: "MP3, WAV", colors: ["#A06BFF", "#FF9F4A"] },
    { id: "video", title: "Video", subtitle: "MP4, MKV", colors: ["#4D9EFF", "#2EC8C8"] },
    { id: "archive", title: "Archives", subtitle: "ZIP, RAR", colors: ["#2EC8C8", "#FF9F4A"] },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.h1}>Good to see you</Text>
        <Text style={styles.p}>Convert files quickly and privately — everything stays on your device.</Text>

        <View style={{ marginTop: 18 }}>
          {categories.map((c) => (
            <TouchableOpacity key={c.id} onPress={() => nav.navigate("Converter", { category: c.id })}>
              <CategoryCard title={c.title} subtitle={c.subtitle} colors={c.colors} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />

        <AdBanner />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
