// components/ui/menu-button.tsx
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
  /** 覆盖图标颜色（优先级最高）；也兼容 tintColor/iconColor */
  color?: string;
  tintColor?: string; // 兼容别名
  iconColor?: string; // 兼容别名
  /** 图标大小（dp），默认 22 */
  size?: number;
  /** 容器样式 */
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

  // 最终颜色：prop > alias > 主题默认
  const finalColor =
    color ?? tintColor ?? iconColor ?? (isDark ? "#FFFFFF" : "#111827");

  const handlePress = () => {
    if (onPress) return onPress();
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
  btn: {
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
