// All comments in English only.
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useGoogleAuth } from "@/src/lib/auth/google";
import { useAuthProfile } from "@/src/store/useAuthProfile";
import { isProfileComplete } from "@/src/types/profile";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");

export default function SignInScreen() {
  const router = useRouter();
  const { promptAsync } = useGoogleAuth();
  const profile = useAuthProfile((s) => s.profile);
  const insets = useSafeAreaInsets();

  // Breathing glow animation
  const glowAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
    if (!profile) return;
    const next = isProfileComplete(profile)
      ? ("/channels" as const)
      : ("/profile" as const);
    router.replace(next);
  }, [profile, router]);

  const handleTermsPress = () => {
    console.log("Navigate to Terms of Service");
  };
  const handlePrivacyPress = () => {
    console.log("Navigate to Privacy Policy");
  };

  // Derived animation values
  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.28],
  });

  return (
    <View style={styles.container}>
      {/* Gradient hero section */}
      <View style={styles.backgroundSection}>
        <LinearGradient
          colors={["#667eea", "#764ba2", "#667eea"]}
          locations={[0, 0.5, 1]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Lottie fills the entire gradient as the background */}
          {/* Lottie fills the entire gradient as the background */}
          <View pointerEvents="none" style={styles.lottieWrap}>
            <LottieView
              source={require("../../assets/animations/awaiting.json")}
              autoPlay
              loop
              style={styles.lottieFill}
              resizeMode="cover"
            />
          </View>

          {/* Back button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回"
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + 16 }]}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>

          {/* Single breathing halo (top only) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.topGlow,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          {/* Headline + description (plain text) */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>欢迎来到Tatasbox</Text>
            <Text style={styles.subtitle}>您的私人成长空间</Text>

            {/* Plain description text, not a button */}
            <Text style={styles.description}>
              立即注册，开启您的个性化成长旅程
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
        <View style={styles.actionSection}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => promptAsync()}
          >
            <LinearGradient
              colors={["#FFFFFF", "#F8FAFC"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.buttonContent}>
                <View style={styles.googleIconContainer}>
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                </View>
                <Text style={styles.buttonText}>使用 Google 邮箱注册</Text>
                <View style={styles.buttonArrow}>
                  <Ionicons name="arrow-forward" size={16} color="#667eea" />
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Helper text */}
          <View style={styles.helperContainer}>
            <Text style={styles.helperText}>注册即表示您同意我们的</Text>
            <Pressable onPress={handleTermsPress}>
              <Text style={styles.linkText}>服务条款</Text>
            </Pressable>
            <Text style={styles.helperText}>和</Text>
            <Pressable onPress={handlePrivacyPress}>
              <Text style={styles.linkText}>隐私政策</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom decorations (minimal) */}
      <View style={styles.bottomDecoration}>
        <View style={styles.waveDecoration} />
        <View style={styles.floatingOrbs}>
          <View style={[styles.orb, styles.orbLarge]} />
          <View style={[styles.orb, styles.orbMedium]} />
          <View style={[styles.orb, styles.orbSmall]} />
          <View style={[styles.orb, styles.orbMedium]} />
          <View style={[styles.orb, styles.orbLarge]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  // Taller hero to fit content comfortably
  backgroundSection: {
    height: height * 0.66,
    position: "relative",
  },
  backgroundGradient: {
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingBottom: 28, // a bit more bottom padding since desc is plain text now
  },

  // Lottie absolute fill background
  lottieFill: {
    ...RNStyleSheet.absoluteFillObject,
    opacity: 0.24, // keep text readable
  },
  lottieWrap: {
    ...StyleSheet.absoluteFillObject, // absolute fill wrapper
  },

  backBtn: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // Content stack in hero
  titleSection: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 52,
    paddingBottom: 8,
    zIndex: 2,
    gap: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Plain description (not a pill/button)
  description: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.96)",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    maxWidth: 320,
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.08)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Single, breathing halo (top only)
  topGlow: {
    position: "absolute",
    top: -100,
    left: width * 0.22,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#FFFFFF",
  },

  mainContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  actionSection: {
    alignItems: "center",
    marginTop: -6, // subtle overlap towards hero
  },

  button: {
    width: "100%",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
    marginBottom: 20,
  },
  buttonGradient: { paddingVertical: 18, paddingHorizontal: 24 },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(219, 68, 55, 0.1)",
    borderRadius: 6,
    padding: 2,
  },
  buttonText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.2,
    flex: 1,
    textAlign: "center",
  },
  buttonArrow: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 12,
  },

  helperContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "400",
  },
  linkText: {
    fontSize: 13,
    color: "#667eea",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
    marginHorizontal: 4,
    textDecorationLine: "underline",
  },

  bottomDecoration: { position: "absolute", bottom: 0, left: 0, right: 0 },
  waveDecoration: {
    height: 24,
    backgroundColor: "rgba(102, 126, 234, 0.03)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  floatingOrbs: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 32,
  },
  orb: { backgroundColor: "rgba(102, 126, 234, 0.1)", borderRadius: 50 },
  orbLarge: { width: 8, height: 8 },
  orbMedium: { width: 6, height: 6 },
  orbSmall: { width: 4, height: 4 },
});
