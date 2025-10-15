import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Path, Polygon } from "react-native-svg";
import { useTheme } from "@/providers/ThemeProvider";
import StartNowBar from "@/components/home/StartNowBar";
import TopBar from "@/components/ui/TopBar";

/** ---------- Topics (icon names from Ionicons) ---------- */
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
const TOPICS: { label: string; icon: IoniconName }[] = [
  { label: "天气", icon: "cloud-outline" },
  { label: "美食", icon: "fast-food-outline" },
  { label: "交友", icon: "people-outline" },
  { label: "体育", icon: "football-outline" },
  { label: "音乐", icon: "musical-notes-outline" },
  { label: "育儿", icon: "happy-outline" },
  { label: "宠物", icon: "paw-outline" },
  { label: "旅游", icon: "airplane-outline" },
  { label: "经济", icon: "cash-outline" },
];

/** ---------- Soft colors for slices ---------- */
const COLORS = [
  "#FDE68A",
  "#A7F3D0",
  "#C7D2FE",
  "#FBCFE8",
  "#FCA5A5",
  "#BFDBFE",
  "#FCD34D",
  "#86EFAC",
  "#F5D0FE",
];

/** ---------- Geometry helpers ---------- */
function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (Math.PI / 180) * deg;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function wedgePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
}
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** ---------- Result Modal (reusable) ---------- */
type ResultModalProps = {
  visible: boolean;
  topic?: { label: string; icon: IoniconName } | null;
  onClose: () => void;
  onRespin: () => void;
  onConfirm: () => void;
};
const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  topic,
  onClose,
  onRespin,
  onConfirm,
}) => {
  const { colors, isDark } = useTheme();

  // Simple scale+fade animation on show/hide
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, scale]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none" // we animate manually
      statusBarTranslucent
    >
      {/* Backdrop: press to close */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Prevent inner card from receiving the backdrop press */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              transform: [{ scale }],
              opacity,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Close (X) button */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons
              name="close"
              size={22}
              color={isDark ? "#E5E7EB" : "#374151"}
            />
          </TouchableOpacity>

          {/* Icon + Title */}
          <View style={{ alignItems: "center", marginTop: 6 }}>
            <View style={styles.topicIconWrap}>
              <Ionicons
                name={topic?.icon ?? "pricetag-outline"}
                size={28}
                color={isDark ? "#111827" : "#111827"}
              />
            </View>
            <Text
              style={[
                styles.cardTitle,
                { color: isDark ? "#E5E7EB" : "#111827" },
              ]}
            >
              选中的主题是
            </Text>
            <Text style={[styles.cardTopic, { color: "#F59E0B" }]}>
              {topic?.label ?? "--"}
            </Text>
            <Text
              style={[
                styles.cardSubtitle,
                { color: isDark ? "#9CA3AF" : "#6B7280" },
              ]}
            >
              要继续聊天还是再转一次？
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onRespin}
              style={[
                styles.btnOutline,
                {
                  borderColor: isDark ? "#374151" : "#D1D5DB",
                  backgroundColor: isDark ? "#0B1020" : "#FFFFFF",
                },
              ]}
            >
              <Text
                style={[
                  styles.btnOutlineText,
                  { color: isDark ? "#E5E7EB" : "#111827" },
                ]}
              >
                再选
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.btnPrimary, { backgroundColor: "#F59E0B" }]}
            >
              <Text style={styles.btnPrimaryText}>确认</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

/** ---------- Main Page ---------- */
export default function RandomTopicPage() {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();

  const size = Math.min(width - 32, 340);
  const radius = size / 2;

  const N = TOPICS.length;
  const angle = 360 / N;

  // rotation value (degrees)
  const rot = useRef(new Animated.Value(0)).current;
  const rotValueRef = useRef(0);
  rot.addListener(({ value }) => (rotValueRef.current = value));

  const [spinning, setSpinning] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Modal state
  const [resultVisible, setResultVisible] = useState(false);
  const [resultTopic, setResultTopic] = useState<{
    label: string;
    icon: IoniconName;
  } | null>(null);

  // slices: slice #0 center at -90° (top)
  const sectors = useMemo(() => {
    const base = -90 - angle / 2;
    return Array.from({ length: N }).map((_, i) => {
      const start = base + i * angle;
      const end = start + angle;
      const mid = start + angle / 2;
      return { i, start, end, mid, color: COLORS[i % COLORS.length] };
    });
  }, [N, angle]);

  /** Spin with precise landing at slice center (top pointer) */
  const onSpin = () => {
    if (spinning) return;

    const targetIndex = Math.floor(Math.random() * N);
    const baseTurns = 5;

    const current = rotValueRef.current;
    // Pointer fixed at -90°:
    // (-90 + i*angle + rot) ≡ -90 (mod 360) => rot ≡ -i*angle (mod 360)
    const targetDegMod = mod(-targetIndex * angle, 360);
    const deltaToTarget = mod(targetDegMod - mod(current, 360), 360);
    const finalDeg = current + baseTurns * 360 + deltaToTarget;

    setSpinning(true);
    Animated.timing(rot, {
      toValue: finalDeg,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rot.setValue(finalDeg);
      setSpinning(false);

      const norm = mod(finalDeg, 360);
      const idx = mod(Math.round(-norm / angle), N);

      setSelectedIdx(idx);

      // Open custom modal instead of system Alert
      const hit = TOPICS[idx];
      setResultTopic(hit);
      setResultVisible(true);
    });
  };

  // Top triangle (tip touches the rim)
  const TRI_W = 32;
  const TRI_H = 22;

  // Actions from modal
  const handleConfirm = () => {
    setResultVisible(false);
    const hit = resultTopic ?? TOPICS[selectedIdx];
    router.push({
      pathname: "/channels/communication/random/chat",
      params: { topic: hit.label },
    });
  };
  const handleRespin = () => {
    setResultVisible(false);
    // Ensure modal is fully closed before starting spin
    setTimeout(onSpin, 50);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <TopBar left="back" />

      {/* Current selection text */}
      <View style={styles.selectedWrap}>
        <Text
          style={[
            styles.selectedPrefix,
            { color: isDark ? "#D1D5DB" : "#6B7280" },
          ]}
        >
          选中的主题为：
          <Text style={[styles.selectedValue, { color: "#F59E0B" }]}>
            {TOPICS[selectedIdx].label}
          </Text>
        </Text>
      </View>

      {/* Wheel */}
      <View
        style={[
          styles.centerWrap,
          { paddingBottom: 110 /* leave space for StartNowBar */ },
        ]}
      >
        <View style={{ width: size, height: size }}>
          {/* spinning wheel */}
          <Animated.View
            style={{
              width: size,
              height: size,
              transform: [
                {
                  rotate: rot.interpolate({
                    inputRange: [-36000, 36000],
                    outputRange: ["-36000deg", "36000deg"],
                  }),
                },
              ],
            }}
          >
            <Svg width={size} height={size}>
              <G>
                {sectors.map((s, idx) => (
                  <Path
                    key={idx}
                    d={wedgePath(radius, radius, radius, s.start, s.end)}
                    fill={s.color}
                    stroke={isDark ? "rgba(0,0,0,0.2)" : "#fff"}
                    strokeWidth={1}
                  />
                ))}
                {/* center disc for contrast */}
                <Circle
                  cx={radius}
                  cy={radius}
                  r={radius * 0.5}
                  fill={colors.background}
                />
              </G>
            </Svg>

            {/* icons + labels (upright by counter-rotating) */}
            {sectors.map((s, idx) => {
              const r = radius * 0.72;
              const pos = polarToCartesian(radius, radius, r, s.mid);
              return (
                <View
                  key={`ico-${idx}`}
                  style={[
                    styles.iconHolder,
                    { left: pos.x - 24, top: pos.y - 24 },
                  ]}
                >
                  <View
                    style={{
                      transform: [{ rotate: `${-s.mid}deg` }],
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={TOPICS[idx].icon}
                      size={22}
                      color={isDark ? "#0B1020" : "#111827"}
                    />
                    <Text
                      style={[
                        styles.sliceLabel,
                        { color: isDark ? "#0B1020" : "#111827" },
                      ]}
                    >
                      {TOPICS[idx].label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>

          {/* fixed top triangle pointer — only the tip touches the circle */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -TRI_H,
              left: size / 2 - TRI_W / 2,
              width: TRI_W,
              height: TRI_H,
              zIndex: 10,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
            }}
          >
            <Svg width={TRI_W} height={TRI_H}>
              {/* upside-down triangle: base on top, tip downwards */}
              <Polygon
                points={`${TRI_W / 2},${TRI_H} 0,0 ${TRI_W},0`}
                fill="#F59E0B"
              />
            </Svg>
          </View>
        </View>
      </View>

      {/* Big breathing button; disabled while spinning or modal open */}
      <StartNowBar
        onPress={spinning || resultVisible ? undefined : onSpin}
        bottomFraction={1 / 8}
      />

      {/* Custom Result Modal */}
      <ResultModal
        visible={resultVisible}
        topic={resultTopic}
        onClose={() => setResultVisible(false)}
        onRespin={handleRespin}
        onConfirm={handleConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  selectedWrap: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  selectedPrefix: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 30,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 6,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  iconHolder: {
    position: "absolute",
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  sliceLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
  },

  /** Modal styles */
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
  },
  closeBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
  },
  cardTopic: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "900",
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 6,
  },
  btnOutline: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlineText: {
    fontSize: 16,
    fontWeight: "800",
  },
  btnPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },
  topicIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDE68A", // soft yellow badge
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 6,
  },
});
