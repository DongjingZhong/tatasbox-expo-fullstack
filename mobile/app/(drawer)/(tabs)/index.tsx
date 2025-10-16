// All code comments in English only.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import StartNowBar from "@/components/home/StartNowBar";
import ChatBubble from "@/components/ui/ChatBubble";
import TalkingAvatar from "@/components/ui/TalkingAvatar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import TopBar from "@/components/ui/TopBar";
import { useTheme } from "@/providers/ThemeProvider";

// Auth/profile store + validator
import { useAuthProfile } from "@/src/store/useAuthProfile";
import { isProfileComplete } from "@/src/types/profile";

const WELCOME =
  "Hi，欢迎来到 Tatasbox。这里是可以让你安全地练习决策、语言交流、自我探索的私人空间。请点击下方的按钮开始体验。";

type AvatarMode = "speaking" | "waving" | "awaiting";

export default function Home() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // Store bindings
  const hydrate = useAuthProfile((s) => s.hydrate);
  const hydrated = useAuthProfile((s) => s.hydrated); // ← NEW

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Voice + avatar
  const [speaking, setSpeaking] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>("waving");

  const startSpeaking = useCallback(() => {
    Speech.stop();
    Speech.speak(WELCOME, {
      language: "zh-CN",
      rate: 0.97,
      onStart: () => {
        setSpeaking(true);
        setAvatarMode("speaking");
      },
      onDone: () => {
        setSpeaking(false);
        setIsVoiceOn(false);
        setAvatarMode("awaiting");
      },
      onStopped: () => {
        setSpeaking(false);
        setIsVoiceOn(false);
        setAvatarMode("awaiting");
      },
      onError: () => {
        setSpeaking(false);
        setIsVoiceOn(false);
        setAvatarMode("awaiting");
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const toggleVoice = () => {
    if (!isVoiceOn) {
      setIsVoiceOn(true);
      startSpeaking();
    } else {
      Speech.stop();
      setIsVoiceOn(false);
      setSpeaking(false);
      setAvatarMode("waving");
    }
  };

  // Robust PLAY handler: ensure hydration, then branch
  const onPlay = useCallback(async () => {
    // Ensure hydration completed; if not, run it once more and wait
    if (!hydrated) {
      await hydrate();
    }

    // Re-read the freshest state directly from the store to avoid stale closures
    const { profile: pNow, signedIn: sNow } = useAuthProfile.getState();

    if (!sNow || !pNow) {
      router.push("/(auth)/sign-in");
      return;
    }

    if (!isProfileComplete(pNow)) {
      // Profile exists but incomplete → take user to complete it
      router.push("/profile"); // or "/(onboarding)/complete-profile"
      return;
    }

    // All good → go to channels
    router.push("/channels");
  }, [hydrated, hydrate]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarWrap}>
          <TalkingAvatar
            speaking={speaking}
            level={speaking ? 0.7 : 0}
            size={260}
            waveColor="#7C3AED"
            mode={avatarMode}
          />
        </View>

        <ChatBubble
          variant="incoming"
          text={WELCOME}
          rightAccessory={
            <Pressable
              onPress={toggleVoice}
              hitSlop={10}
              style={[
                styles.sideSpeakerBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "#FFFFFF",
                },
              ]}
            >
              <Ionicons
                name={isVoiceOn ? "volume-high-outline" : "volume-mute-outline"}
                size={20}
                color={isVoiceOn ? "#4F46E5" : isDark ? "#9CA3AF" : "#6B7280"}
              />
            </Pressable>
          }
          style={{ marginTop: 16, paddingHorizontal: 8 }}
        />
      </ScrollView>

      {/* ▶ PLAY — guarded by hydration inside the handler */}
      <StartNowBar onPress={onPlay} bottomFraction={1 / 5} />

      {/* Floating ThemeToggle */}
      <View
        pointerEvents="box-none"
        style={[styles.themeToggleFloating, { bottom: 10 + insets.bottom }]}
      >
        <ThemeToggle />
      </View>
    </SafeAreaView>
  );
}

const THEME_GREEN = "#7FA392";

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brand: {
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#111827",
    textShadowColor: "rgba(0,0,0,0.08)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  brandMain: {},
  brandAccent: { color: THEME_GREEN },
  iconBtnTransparent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 200 },
  avatarWrap: { alignItems: "center", marginTop: 8 },
  bubbleRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  bubbleWrap: { alignSelf: "flex-start", position: "relative", marginLeft: 8 },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  bubbleTail: {
    position: "absolute",
    left: 0,
    bottom: 6,
    width: 12,
    height: 12,
    transform: [{ rotate: "45deg" }],
    borderBottomLeftRadius: 2,
  },
  bubbleText: {},
  sideSpeakerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  themeToggleFloating: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 90,
  },
});
