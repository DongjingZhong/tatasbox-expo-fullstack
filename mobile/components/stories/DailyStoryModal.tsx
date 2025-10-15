// All comments in English only.
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
  Platform,
  Share,
  NativeSyntheticEvent,
  TextLayoutEventData,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme as useAppTheme } from "@/providers/ThemeProvider";

export type Story = {
  id?: string;
  title: string;
  content: string;
  voiceLang?: string; // e.g. "zh-CN", "es-ES", etc.
};

type Props = {
  visible: boolean;
  story: Story;
  onClose: () => void;
  onNext: () => void;
};

const CONTENT_LINE_HEIGHT = 26; // Increased for better readability
const CONTENT_PADDING_V = 16; // Increased padding
const TITLE_BOTTOM_GAP = 24; // Refined spacing

const DailyStoryModal: React.FC<Props> = ({
  visible,
  story,
  onClose,
  onNext,
}) => {
  const { width, height } = useWindowDimensions();

  // Theme
  const appTheme = useAppTheme?.() as any;
  const systemScheme = useColorScheme();
  const isDark = appTheme?.isDark ?? systemScheme === "dark";
  const textColor = appTheme?.colors?.text ?? (isDark ? "#E5E7EB" : "#111827");
  const cardBg = appTheme?.colors?.card ?? (isDark ? "#1A2235" : "#FFFFFF");
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  // Enhanced color scheme
  const iconColor =
    appTheme?.colors?.accentIcon ?? (isDark ? "#FCD34D" : "#0EA5E9");
  const iconPressedBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const secondaryText = isDark ? "#9CA3AF" : "#6B7280";

  // Softer overlay with better blending
  const overlayBaseColor = isDark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.45)";

  // Animations
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      overlayOpacity.setValue(0);
      scale.setValue(0.9);
      translateY.setValue(20);
      Speech.stop();
    }
  }, [visible, overlayOpacity, scale, translateY]);

  // TTS
  const [speaking, setSpeaking] = useState(false);
  const toggleSpeak = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(`${story.title}。${story.content}`, {
      language: story.voiceLang || "zh-CN",
      pitch: 1.0,
      rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  // Share
  const shareStory = async () => {
    try {
      await Share.share({
        title: story.title,
        message: `${story.title}\n\n${story.content}\n— Sent from Tatasbox`,
      });
    } catch {
      // ignore
    }
  };

  const handleClose = () => {
    Speech.stop();
    setSpeaking(false);
    onClose();
  };

  // Responsive dimensions
  const modalW = Math.round(Math.min(width * 0.86, 400));
  const minH = Math.round(height * 0.65);
  const maxH = Math.round(height * 0.82);

  // Measure sections to compute dynamic height
  const [topBarH, setTopBarH] = useState(0);
  const [titleWrapH, setTitleWrapH] = useState(0);
  const [footerH, setFooterH] = useState(0);
  const [lineCount, setLineCount] = useState<number | null>(null);

  const computedCardH = useMemo(() => {
    const contentH =
      Math.max(1, lineCount ?? 1) * CONTENT_LINE_HEIGHT + CONTENT_PADDING_V * 2;

    const titleWithGap = titleWrapH
      ? titleWrapH - 12 + TITLE_BOTTOM_GAP
      : TITLE_BOTTOM_GAP;

    const raw = topBarH + titleWithGap + contentH + footerH;
    return Math.min(maxH, Math.max(minH, Math.round(raw)));
  }, [lineCount, topBarH, titleWrapH, footerH, minH, maxH]);

  // Enhanced gradient for CTA
  const gradFrom = isDark ? "#FACC15" : "#FDE68A";
  const gradTo = isDark ? "#EAB308" : "#F59E0B";

  // Text line measurement
  const onTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    setLineCount(e.nativeEvent.lines?.length ?? 1);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: overlayBaseColor, opacity: overlayOpacity },
        ]}
      >
        <Animated.View
          style={[
            styles.card,
            {
              width: modalW,
              height: computedCardH,
              backgroundColor: cardBg,
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          {/* Enhanced Top Bar */}
          <View
            style={[styles.topBar, { borderBottomColor: borderColor }]}
            onLayout={(e) => setTopBarH(e.nativeEvent.layout.height)}
          >
            <View style={styles.topIcons}>
              <Pressable
                onPress={toggleSpeak}
                accessibilityRole="button"
                accessibilityLabel={speaking ? "Stop reading" : "Read story"}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && { backgroundColor: iconPressedBg },
                ]}
              >
                <Ionicons
                  name={speaking ? "volume-high" : "volume-medium"}
                  size={20}
                  color={iconColor}
                />
              </Pressable>

              <Pressable
                onPress={shareStory}
                accessibilityRole="button"
                accessibilityLabel="Share story"
                hitSlop={12}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && { backgroundColor: iconPressedBg },
                ]}
              >
                <Ionicons name="share-social" size={20} color={iconColor} />
              </Pressable>
            </View>

            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { backgroundColor: iconPressedBg },
              ]}
            >
              <Ionicons name="close" size={22} color={secondaryText} />
            </Pressable>
          </View>

          {/* Enhanced Title Section */}
          <View
            style={[styles.titleWrap, { paddingBottom: TITLE_BOTTOM_GAP }]}
            onLayout={(e) => setTitleWrapH(e.nativeEvent.layout.height)}
          >
            <Text style={[styles.title, { color: textColor }]}>
              {story.title}
            </Text>
          </View>

          {/* Enhanced Scrollable Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text
              style={[styles.content, { color: textColor }]}
              onTextLayout={onTextLayout}
              textBreakStrategy="highQuality"
            >
              {story.content}
            </Text>
          </ScrollView>

          {/* Enhanced Footer */}
          <View
            style={[styles.footer, { borderTopColor: borderColor }]}
            onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}
          >
            <Pressable
              onPress={() => {
                Speech.stop();
                setSpeaking(false);
                onNext();
              }}
              accessibilityRole="button"
              accessibilityLabel="Get next story"
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={[gradFrom, gradTo]}
                style={styles.nextBtn}
              >
                <Ionicons name="sparkles" size={18} color="#111827" />
                <Text style={styles.nextBtnText}>获取下一个故事</Text>
                <Ionicons name="arrow-forward" size={18} color="#111827" />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default DailyStoryModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 20,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  topIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
  },
  titleWrap: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 32,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  contentScroll: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingVertical: CONTENT_PADDING_V,
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    fontSize: 17,
    lineHeight: CONTENT_LINE_HEIGHT,
    letterSpacing: 0.1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  nextBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.2,
  },
});
