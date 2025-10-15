// components/ui/ThemeToggle.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

const ThemeToggle: React.FC = () => {
  const { mode, setMode, colors } = useTheme();
  const isDark = mode === "dark";

  // 动画值
  const slideAnim = React.useRef(new Animated.Value(isDark ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isDark ? 1 : 0,
      tension: 150,
      friction: 15,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  const sliderTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 50],
  });

  // 使用类型安全的颜色回退值
  const shadowColor = (
    "shadow" in colors ? colors.shadow : "#000000"
  ) as string;
  const textSecondaryColor = (
    "textSecondary" in colors ? colors.textSecondary : colors.text
  ) as string;
  const backgroundColor = (
    "background" in colors ? colors.background : "#FFFFFF"
  ) as string;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.toggleContainer,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            shadowColor: shadowColor,
          },
        ]}
      >
        {/* 滑动指示器 */}
        <Animated.View
          style={[
            styles.slider,
            {
              backgroundColor: colors.primary,
              transform: [{ translateX: sliderTransform }],
            },
          ]}
        />

        {/* Light mode */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="切换到白天模式"
          accessibilityState={{ selected: !isDark }}
          onPress={() => setMode("light")}
          style={styles.iconButton}
          hitSlop={12}
          android_ripple={{
            color: `${colors.primary}20`,
            borderless: false,
            radius: 20,
          }}
        >
          <Ionicons
            name="sunny"
            size={20}
            color={!isDark ? backgroundColor : textSecondaryColor}
            style={!isDark ? styles.activeIcon : styles.inactiveIcon}
          />
        </Pressable>

        {/* Dark mode */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="切换到夜间模式"
          accessibilityState={{ selected: isDark }}
          onPress={() => setMode("dark")}
          style={styles.iconButton}
          hitSlop={12}
          android_ripple={{
            color: `${colors.primary}20`,
            borderless: false,
            radius: 20,
          }}
        >
          <Ionicons
            name="moon"
            size={18}
            color={isDark ? backgroundColor : textSecondaryColor}
            style={isDark ? styles.activeIcon : styles.inactiveIcon}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 6,
    width: 96,
    height: 48,
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  slider: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 12,
    left: 6,
    zIndex: 0,
  },
  iconButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    borderRadius: 10,
    zIndex: 1,
    minWidth: 40,
    minHeight: 40,
  },
  activeIcon: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  inactiveIcon: {
    opacity: 0.7,
  },
});

export default ThemeToggle;
