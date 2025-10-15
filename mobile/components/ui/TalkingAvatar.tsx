// components/ui/TalkingAvatar.tsx
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Svg, {
  Defs,
  Ellipse,
  Stop,
  RadialGradient as SvgRadialGradient,
} from "react-native-svg";
import { useTheme } from "../../providers/ThemeProvider";

type AvatarMode = "speaking" | "waving" | "awaiting";

type Props = {
  speaking?: boolean; // pulse rings when TTS speaking
  level?: number; // 0..1 mic level when not speaking
  size?: number; // overall size
  waveColor?: string; // ring stroke color
  mode?: AvatarMode; // which lottie to show
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const TalkingAvatar: React.FC<Props> = ({
  speaking,
  level = 0,
  size = 220,
  waveColor = "#6366F1", // indigo-500
  mode = "awaiting",
}) => {
  const { isDark, colors } = useTheme();

  const amp = useRef(new Animated.Value(0)).current;
  const lastLevelRef = useRef(0);
  const lottieRef = useRef<LottieView>(null);

  // 发光动画控制
  const glowIntensity = useRef(new Animated.Value(0.2)).current;

  // rings animation
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (speaking) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(amp, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(amp, {
            toValue: 0,
            duration: 700,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      // 说话时增强发光
      Animated.timing(glowIntensity, {
        toValue: 0.8,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(amp, {
        toValue: clamp01(lastLevelRef.current),
        duration: 160,
        useNativeDriver: true,
      }).start();

      // 安静时减弱发光
      Animated.timing(glowIntensity, {
        toValue: 0.2 + level * 0.3,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    return () => loop?.stop?.();
  }, [speaking, amp, glowIntensity, level]);

  // update level when not speaking
  useEffect(() => {
    const clamped = clamp01(level);
    lastLevelRef.current = clamped;
    if (!speaking) {
      Animated.timing(amp, {
        toValue: clamped,
        duration: 120,
        useNativeDriver: true,
      }).start();

      // 根据音量微调发光强度
      Animated.timing(glowIntensity, {
        toValue: 0.2 + clamped * 0.3,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [level, speaking, amp, glowIntensity]);

  // layout
  const W = size;
  const base = size * 0.64;
  const left = (W - base) / 2;
  const top = (W - base) / 2;
  const radius = base / 2;

  // rings driven by amp
  const midScale = amp.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.18],
  });
  const outerScale = amp.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.36],
  });
  const midAlpha = amp.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.12],
  });
  const outerAlpha = amp.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.0],
  });

  // 精简的发光效果 - 只比圆形大一点点
  const glowOpacity = glowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.35],
  });

  const glowScale = glowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.15], // 非常克制的缩放
  });

  // 紧凑的发光尺寸 - 只比头像大20-30%
  const glowW = base * 1.1; // 只比基础圆形大10%
  const glowH = base * 1.1;

  // 发光颜色 - 使用更柔和的色调
  const glowColor = isDark ? "#fdfdff" : waveColor; // indigo-400

  // choose lottie by mode
  const lottieSource =
    mode === "speaking"
      ? require("../../assets/animations/speaking3.json")
      : mode === "waving"
      ? require("../../assets/animations/waving.json")
      : require("../../assets/animations/awaiting.json");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setMeasured] = useState({ w: base, h: base });
  const onCenterLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMeasured({ w: Math.round(width), h: Math.round(height) });
  };

  return (
    <View
      style={{
        width: W,
        height: W,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 精简的单层发光效果 */}
      {isDark && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowWrap,
            {
              width: glowW,
              height: glowH,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox={`0 0 ${glowW} ${glowH}`}>
            <Defs>
              {/* 紧凑的径向渐变 */}
              <SvgRadialGradient id="avatarGlow" cx="50%" cy="50%" r="60%">
                <Stop offset="0%" stopColor={glowColor} stopOpacity={0.6} />
                <Stop offset="70%" stopColor={glowColor} stopOpacity={0.2} />
                <Stop offset="100%" stopColor={glowColor} stopOpacity={0.0} />
              </SvgRadialGradient>
            </Defs>
            <Ellipse
              cx={glowW / 2}
              cy={glowH / 2}
              rx={glowW / 2}
              ry={glowH / 2}
              fill="url(#avatarGlow)"
            />
          </Svg>
        </Animated.View>
      )}

      {/* 声波纹理环 */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            left,
            top,
            width: base,
            height: base,
            borderRadius: radius,
            borderColor: waveColor,
            opacity: outerAlpha,
            transform: [{ scale: outerScale }],
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            left,
            top,
            width: base,
            height: base,
            borderRadius: radius,
            borderColor: waveColor,
            opacity: midAlpha,
            transform: [{ scale: midScale }],
          },
        ]}
      />

      {/* 中心Lottie动画容器 */}
      <View
        onLayout={onCenterLayout}
        style={{
          position: "absolute",
          left,
          top,
          width: base,
          height: base,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: isDark ? colors.card : "#fff",
          // 精致的发光边框
          borderWidth: isDark ? 1.5 : 0,
          borderColor: isDark ? "rgba(129, 140, 248, 0.6)" : "transparent",
          // 微妙的阴影
          shadowColor: isDark ? glowColor : "#000",
          shadowOpacity: isDark ? 0.25 : 0.08,
          shadowRadius: isDark ? 8 : 6,
          shadowOffset: { width: 0, height: isDark ? 2 : 4 },
          elevation: isDark ? 3 : 2,
        }}
      >
        <LottieView
          key={mode}
          ref={lottieRef}
          source={lottieSource}
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          enableMergePathsAndroidForKitKatAndAbove
          hardwareAccelerationAndroid
          cacheComposition={Platform.OS === "ios"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
  glowWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TalkingAvatar;
