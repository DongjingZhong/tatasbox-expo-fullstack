// components/home/StartNowBar.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../providers/ThemeProvider";

type Props = {
  onPress?: () => void;
  /** Distance from bottom by fraction of screen height (center of button). Only for variant="fixed". Default 0.2 (=1/5). */
  bottomFraction?: number;
  /** Button diameter */
  size?: number;
  /** Layout mode: "fixed" = floating at bottom (old behavior); "inline" = sits in content flow */
  variant?: "fixed" | "inline";
  /** Extra container style */
  containerStyle?: StyleProp<ViewStyle>;
};

// 夜间模式优化的金色调色板 - 更深的底色配合明亮的发光效果
const Y_LIGHT = "#FFE067";
const Y_BASE = "#FFC224";
const Y_DEEP = "#FFB000";

// 夜间模式专用发光颜色
const GLOW_LIGHT = "#FFE580";
const GLOW_INTENSE = "#FFD700";

const StartNowBar: React.FC<Props> = ({
  onPress,
  bottomFraction = 0.2,
  size = 96,
  variant = "fixed",
  containerStyle,
}) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  /** Keep the button center at bottomFraction of screen height (fixed mode only) */
  const MIN_CLEARANCE = 56;
  const centerFromBottom = height * bottomFraction;
  const bottomOffset =
    insets.bottom + Math.max(centerFromBottom - size / 2, MIN_CLEARANCE);

  // --- animations ---
  const pulse = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    // 独立的发光脉冲动画
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    return () => {
      loop.stop();
      glowLoop.stop();
    };
  }, [pulse, glowPulse]);

  const breatheScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });
  const pressScale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  const handlePressIn = () =>
    Animated.timing(press, {
      toValue: 1,
      duration: 110,
      useNativeDriver: true,
    }).start();
  const handlePressOut = () =>
    Animated.timing(press, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

  const iconSize = Math.round(size * 0.35);

  // 夜间模式专用发光效果
  const nightGlowStyle: any = isDark
    ? {
        shadowColor: GLOW_INTENSE,
        shadowOpacity: glowPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 0.8],
        }),
        shadowRadius: glowPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 30],
        }),
        shadowOffset: { width: 0, height: 0 },
        // elevation 不能做原生动画，这里给一个固定值
        elevation: 18,
      }
    : {
        shadowColor: "#000000",
        shadowOpacity: 0.16,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
      };

  // 夜间模式内发光效果
  const innerGlowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const isFixed = variant === "fixed";

  return (
    <View
      pointerEvents={isFixed ? "box-none" : "auto"}
      style={[
        isFixed
          ? [styles.floatingWrap, { bottom: bottomOffset }]
          : styles.inlineWrap,
        containerStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={12}
      >
        <Animated.View
          style={[
            styles.circle,
            nightGlowStyle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [
                { scale: Animated.multiply(breatheScale, pressScale) },
              ],
            },
          ]}
        >
          {/* 按钮填充（金色渐变） */}
          <LinearGradient
            colors={
              isDark ? [Y_DEEP, Y_BASE, Y_LIGHT] : [Y_LIGHT, Y_BASE, Y_DEEP]
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.circleFill, { borderRadius: size / 2 }]}
          >
            {/* 夜间模式内发光层 */}
            {isDark && (
              <Animated.View
                style={[
                  styles.innerGlow,
                  {
                    borderRadius: size / 2,
                    opacity: innerGlowOpacity,
                    borderWidth: size * 0.03,
                    borderColor: GLOW_LIGHT,
                  },
                ]}
              />
            )}

            {/* 顶部高光 */}
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.4)",
                "rgba(255,255,255,0.15)",
                "transparent",
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.55 }}
              style={[
                styles.topHighlight,
                {
                  borderTopLeftRadius: size / 2,
                  borderTopRightRadius: size / 2,
                },
              ]}
            />

            {/* 图标容器 */}
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="play-arrow"
                size={iconSize}
                color={isDark ? "#FFF8E1" : "#ffffff"}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default StartNowBar;

const styles = StyleSheet.create({
  // 固定吸底模式（原行为）
  floatingWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  // 内联模式：放在内容流末尾
  inlineWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    // 为了与表单留白协调
    marginTop: 8,
  },
  circle: {
    overflow: "hidden",
  },
  circleFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  innerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 3,
    right: 3,
    height: "46%",
  },
  iconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
});
