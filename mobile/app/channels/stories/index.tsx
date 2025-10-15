// Daily Story landing with Dark/Light theme.
// PLAY will fetch today's story from backend and then open the modal.

import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  Text,
  useColorScheme,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import StartNowBar from "@/components/home/StartNowBar";
import TopBar from "@/components/ui/TopBar";
import { useTheme as useAppTheme } from "@/providers/ThemeProvider";
import DailyStoryModal, {
  type Story,
} from "@/components/stories/DailyStoryModal";

// ✅ 统一走前端封装的 API 客户端
import { fetchToday, fetchNext, API_BASE, pingHealth } from "@/lib/api";

const DailyStoryScreen: React.FC = () => {
  const ClosedBookImg = require("@/assets/images/closed-book.png");
  const OpenedBookImg = require("@/assets/images/book-opened.png");

  const { height, width } = useWindowDimensions();
  const [open, setOpen] = useState(false); // image open/close
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetched story
  const [story, setStory] = useState<Story | null>(null);

  // ---- Theme (App theme > system fallback) ----
  const appTheme = useAppTheme?.() as any;
  const systemScheme = useColorScheme();
  const isDark = appTheme?.isDark ?? systemScheme === "dark";

  const darkDefaults = { bg: "#0B0E14", text: "#E5E7EB" };
  const lightDefaults = { bg: "#FFFFFF", text: "#111827" };
  const themeColors = isDark ? darkDefaults : lightDefaults;

  const bgColor = appTheme?.colors?.background ?? themeColors.bg;
  const textColor = appTheme?.colors?.text ?? themeColors.text;

  const topGap = useMemo(() => Math.max(20, height * 0.1), [height]);
  const bookSize = useMemo(
    () => Math.min(280, Math.max(180, width * 0.55)),
    [width]
  );

  const source = open ? OpenedBookImg : ClosedBookImg;

  // Fetch today's cached story (via API client)
  const handleFetchToday = async () => {
    if (loading) return;
    setLoading(true);
    if (__DEV__) {
      console.log("[UI] PLAY clicked. API_BASE =", API_BASE);
      pingHealth(); // optional: prints /health result
    }
    try {
      const s = await fetchToday();
      if (__DEV__) console.log("[UI] fetchToday success:", s);
      setStory(s);
    } catch (err: any) {
      if (__DEV__) console.log("[UI] fetchToday error:", err?.message || err);
      Alert.alert(
        "获取失败",
        `无法获取今日故事：${err?.message || "网络错误"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate a fresh story (gift/next)
  const handleFetchNext = async () => {
    if (__DEV__) console.log("[UI] Next story clicked");
    try {
      const s = await fetchNext();
      if (__DEV__) console.log("[UI] fetchNext success:", s);
      setStory(s);
    } catch (err: any) {
      if (__DEV__) console.log("[UI] fetchNext error:", err?.message || err);
      Alert.alert("生成失败", `无法生成新故事：${err?.message || "网络错误"}`);
    }
  };

  const onToggleImage = () => setOpen((v) => !v);

  const onOpenModal = async () => {
    if (__DEV__) console.log("[UI] onOpenModal");
    if (!story && !loading) {
      await handleFetchToday();
    }
    setShowModal(true);
  };

  const onCloseModal = () => setShowModal(false);

  const onNextStory = () => {
    handleFetchNext();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <TopBar left="back" />

      <View style={[styles.body, { paddingTop: topGap }]}>
        <Text style={[styles.pageTitle, { color: textColor }]}>
          每日励志故事
        </Text>

        <Pressable
          onPress={onToggleImage}
          accessibilityRole="imagebutton"
          accessibilityLabel="Toggle book open/close"
        >
          <View style={styles.imageShadow}>
            <Image
              source={source}
              style={{ width: bookSize, height: bookSize }}
              resizeMode="contain"
            />
          </View>
        </Pressable>

        {/* PLAY = fetch & open modal */}
        <StartNowBar bottomFraction={1 / 8} onPress={onOpenModal} />
      </View>

      {/* Modal */}
      {showModal && (
        <DailyStoryModal
          visible={showModal}
          story={
            story || {
              id: "placeholder",
              title: loading ? "加载中…" : "暂无故事",
              content: loading ? "请稍候…" : "请点击下方按钮重新获取。",
              // voiceLang 留空即可，Modal 内部会有默认值
            }
          }
          onClose={onCloseModal}
          onNext={onNextStory}
        />
      )}
    </SafeAreaView>
  );
};

export default DailyStoryScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 28,
  },
  imageShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    marginBottom: 12,
  },
});
