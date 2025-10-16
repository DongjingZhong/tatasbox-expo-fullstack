// All comments in English only.
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuthProfile } from "@/src/store/useAuthProfile";
import AppText from "./AppText";
import MenuButton from "./menu-button";

const THEME_GREEN = "#7FA392";

type Props = {
  left?: "menu" | "back";
  onLeftPress?: () => void;
  onNoticePress?: () => void;
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
  const navigation = useNavigation();
  const { isDark, colors } = useTheme();

  // read avatar from local store (persisted in AsyncStorage)
  const avatar = useAuthProfile((s) => s.profile?.avatar);

  const iconColor = isDark ? "#FFFFFF" : "#111827";
  const brandMainColor = colors.text;

  const Left = () => {
    if (left === "menu") {
      return (
        <MenuButton
          {...({ color: iconColor, tintColor: iconColor, iconColor } as any)}
        />
      );
    }
    return (
      <Pressable
        hitSlop={10}
        style={styles.iconBtn}
        onPress={onLeftPress ?? (() => router.back())}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={22} color={iconColor} />
      </Pressable>
    );
  };

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

  const Right = () => {
    return (
      <View style={styles.rightContainer}>
        {showNotice && (
          <Pressable
            hitSlop={10}
            style={styles.iconBtn}
            onPress={onNoticePress ?? (() => console.log("open notices"))}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={iconColor}
            />
          </Pressable>
        )}

        {avatar && (
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            hitSlop={8}
            style={styles.avatarContainer}
          >
            <View
              style={[
                styles.avatarGlow,
                {
                  shadowColor: isDark ? colors.primary : THEME_GREEN,
                  backgroundColor: isDark
                    ? "rgba(127, 163, 146, 0.1)"
                    : "rgba(127, 163, 146, 0.05)",
                },
              ]}
            >
              <Image
                source={{ uri: avatar }}
                style={[
                  styles.avatarImg,
                  {
                    borderColor: isDark
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(0,0,0,0.08)",
                  },
                ]}
              />
            </View>
          </Pressable>
        )}

        {!avatar && <View style={styles.avatarSpacer} />}
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        {
          // Give it a real background so it visually “exists” in layout
          backgroundColor: colors.background,
          borderBottomColor: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.06)",
        },
      ]}
    >
      <View style={styles.header}>
        <Left />
        {Middle}
        <Right />
      </View>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 36;
const AVATAR_GLOW_SIZE = AVATAR_SIZE + 8;

const styles = StyleSheet.create({
  // ⬇️ NOT absolute anymore — it now takes up space in layout
  safeArea: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "transparent",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarGlow: {
    width: AVATAR_GLOW_SIZE,
    height: AVATAR_GLOW_SIZE,
    borderRadius: AVATAR_GLOW_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1.5,
  },
  avatarSpacer: {
    width: 8,
  },
});
