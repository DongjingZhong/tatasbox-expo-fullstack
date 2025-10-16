// components/ui/TopBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../providers/ThemeProvider";
import AppText from "./AppText";
import MenuButton from "./menu-button";

const THEME_GREEN = "#7FA392";

type Props = {
  left?: "menu" | "back";
  onLeftPress?: () => void;
  onNoticePress?: () => void;
  /** 这里仍然允许 ReactNode，但如果是 string，我们会包到 <AppText> */
  title?: React.ReactNode;
  showNotice?: boolean;
};

export default function TopBar({
  left = "menu",
  onLeftPress,
  onNoticePress,
  title,
  showNotice = true,
}: Props) {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  // icon 与品牌主色：暗色=白；亮色=深色文本
  const iconColor = isDark ? "#FFFFFF" : "#111827";
  const brandMainColor = colors.text; // TATAS 跟随主题（暗=白，亮=深）

  const Left = () =>
    left === "menu" ? (
      <MenuButton
        {...({ color: iconColor, tintColor: iconColor, iconColor } as any)}
      />
    ) : (
      <Pressable
        hitSlop={10}
        style={styles.iconBtn}
        onPress={onLeftPress ?? (() => router.back())}
      >
        <Ionicons name="chevron-back" size={22} color={iconColor} />
      </Pressable>
    );

  const Middle =
    title !== undefined && title !== null ? (
      typeof title === "string" ? (
        <AppText
          variant="headline"
          weight="800"
          style={styles.headerTitle}
          numberOfLines={1}
        >
          {title}
        </AppText>
      ) : (
        title
      )
    ) : (
      <AppText variant="title" weight="900" style={styles.brand}>
        <AppText
          variant="title"
          weight="900"
          style={[styles.brandPart, { color: brandMainColor }]}
        >
          TATAS
        </AppText>
        <AppText variant="title" weight="900" style={styles.brandAccent}>
          BOX
        </AppText>
      </AppText>
    );

  const Right = showNotice ? (
    <Pressable
      hitSlop={10}
      style={styles.iconBtn}
      onPress={onNoticePress ?? (() => console.log("open notices"))}
    >
      <Ionicons name="notifications-outline" size={22} color={iconColor} />
    </Pressable>
  ) : (
    <View style={styles.iconBtn} />
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Left />
        {Middle}
        {Right}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "transparent", // Explicitly set to transparent
  },
  brand: {
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  brandPart: {
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  brandAccent: {
    color: THEME_GREEN,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    letterSpacing: 0.2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent", // Ensure button background is transparent
  },
});
