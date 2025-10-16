// All comments in English only.
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

type Props = {
  onPress?: () => void;
  color?: string;
  tintColor?: string;
  iconColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function MenuButton({
  onPress,
  color,
  tintColor,
  iconColor,
  size = 22,
  style,
  accessibilityLabel = "打开菜单",
}: Props) {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const finalColor =
    color ?? tintColor ?? iconColor ?? (isDark ? "#FFFFFF" : "#111827");

  const handlePress = () => {
    // Execute callback rather than returning it (prevents weird loops)
    if (onPress) {
      onPress();
      return;
    }
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.btn, style]}
      android_ripple={{
        color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
      }}
    >
      <View style={styles.iconBox}>
        <Ionicons name="menu" size={size} color={finalColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 12 },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
