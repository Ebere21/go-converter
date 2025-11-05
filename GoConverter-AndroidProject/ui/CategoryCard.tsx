import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function CategoryCard({ title, subtitle, colors }: any) {
  return (
    <LinearGradient colors={colors} style={{ padding: 16, borderRadius: 16, marginBottom: 12 }}>
      <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>{title}</Text>
      <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 6 }}>{subtitle}</Text>
    </LinearGradient>
  );
}
