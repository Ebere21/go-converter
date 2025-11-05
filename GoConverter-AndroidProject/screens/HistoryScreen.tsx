import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../styles";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const h = await AsyncStorage.getItem("conversionHistory");
      setHistory(h ? JSON.parse(h) : []);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Recent Conversions</Text>
      <FlatList
        data={history}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.p}>{item.name}</Text>
            <Text style={styles.small}>Converted to {item.format} • {new Date(item.date).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
