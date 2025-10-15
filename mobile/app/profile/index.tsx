import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.sub}>个人资料 / 订阅 / 设置…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", padding: 16 },
  box: { gap: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { color: "#666" },
});
