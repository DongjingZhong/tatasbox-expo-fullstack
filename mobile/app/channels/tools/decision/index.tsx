// app/channels/tools/decision/index.tsx
import AppText from "@/components/ui/AppText";
import TopBar from "@/components/ui/TopBar";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  G,
  Path,
  Polygon,
  Text as SvgText,
  TSpan,
} from "react-native-svg";

/** ---------- Config ---------- */
const MAX_TITLE_CHARS = 20;
const MIN_ITEMS = 2;
const MAX_ITEMS = 12;
const MAX_ITEM_CHARS = 14;

const PALETTE_1 = ["#9DC3E2", "#90D2D8", "#FADCE4", "#FFB5CC", "#E2B0DB"];
const PALETTE_2 = ["#86E3CE", "#D0E6A5", "#FFDD94", "#FA897B", "#CCABD8"];
const COLORS = [...PALETTE_1, ...PALETTE_2];

// Fixed top pointer (inverted triangle)
const POINTER_W = 34;
const POINTER_H = 30;
const POINTER_GAP = 2; // small gap between circle edge and triangle tip

/** ---------- Helpers ---------- */
const deg2rad = (deg: number) => (deg * Math.PI) / 180;

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const start = {
    x: cx + r * Math.cos(deg2rad(startDeg)),
    y: cy + r * Math.sin(deg2rad(startDeg)),
  };
  const end = {
    x: cx + r * Math.cos(deg2rad(endDeg)),
    y: cy + r * Math.sin(deg2rad(endDeg)),
  };
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

/** Compute rotation delta so index's slice center lands under TOP (-90°). */
function computeDeltaToIndex(
  currentRotationDeg: number,
  itemCount: number,
  index: number
) {
  const slice = 360 / itemCount;
  const targetMod = (((-(index + 0.5) * slice) % 360) + 360) % 360;
  const cur = ((currentRotationDeg % 360) + 360) % 360;
  const base = (targetMod - cur + 360) % 360;
  const extraSpins = 4 + Math.floor(Math.random() * 3); // 4~6 spins
  return base + extraSpins * 360;
}

export default function DecisionWheelScreen() {
  const { width } = useWindowDimensions();
  const size = Math.min(340, width - 32);
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const { colors, isDark } = useTheme();

  // color choices that follow theme
  const textColor = colors.text;
  const muted = colors.mutedText;
  const card = colors.card;
  const border = colors.border;
  const primary = colors.primary;

  // Extra height so the fixed top pointer is not clipped
  const containerH = size + POINTER_H;
  const wheelTopOffset = POINTER_H;

  const [title, setTitle] = useState("今天吃什么");
  const [items, setItems] = useState<string[]>([
    "意大利面",
    "牛排",
    "Pizza",
    "寿司",
    "沙拉",
  ]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const rotate = useRef(new Animated.Value(0)).current;
  const rotationAccumRef = useRef(0);
  const [spinning, setSpinning] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftItems, setDraftItems] = useState<string[]>(items);

  const sliceAngle = 360 / items.length;

  // Adaptive font size by item count
  const itemFontSize = useMemo(() => {
    if (items.length <= 4) return 18;
    if (items.length <= 6) return 16;
    if (items.length <= 8) return 14;
    if (items.length <= 10) return 13;
    return 12;
  }, [items.length]);

  const slices = useMemo(() => {
    return items.map((label, i) => {
      const start = -90 + i * sliceAngle;
      const end = start + sliceAngle;
      const mid = (start + end) / 2;
      const lr = r * 0.62;
      const lx = cx + lr * Math.cos(deg2rad(mid));
      const ly = cy + lr * Math.sin(deg2rad(mid));
      const textRotation = mid + 90;
      const color = COLORS[i % COLORS.length];
      return { i, start, end, mid, lx, ly, textRotation, color, label };
    });
  }, [items, sliceAngle, r, cx, cy]);

  function handleSpin() {
    if (spinning) return;
    if (items.length < MIN_ITEMS) {
      Alert.alert("提示", `至少需要 ${MIN_ITEMS} 个选项`);
      return;
    }
    setSelectedIdx(null);
    setSpinning(true);
    const winner = Math.floor(Math.random() * items.length);
    const delta = computeDeltaToIndex(
      rotationAccumRef.current,
      items.length,
      winner
    );
    const duration = Math.max(1800, Math.min(4800, delta * 4));

    Animated.timing(rotate, {
      toValue: rotationAccumRef.current + delta,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rotationAccumRef.current += delta;

      const final = rotationAccumRef.current;
      const finalMod = ((final % 360) + 360) % 360;
      const slice = 360 / items.length;
      const alpha = (360 - finalMod) % 360; // (-final) mod 360
      const idx = Math.floor(alpha / slice) % items.length;

      setSelectedIdx(idx);
      setSpinning(false);
    });
  }

  function openEditor() {
    setDraftTitle(title);
    setDraftItems(items);
    setEditorOpen(true);
  }

  function saveEditor() {
    const t = draftTitle.trim();
    const cleaned = draftItems.map((s) => s.trim()).filter(Boolean);
    if (!t) return Alert.alert("提示", "请填写主题");
    if (t.length > MAX_TITLE_CHARS)
      return Alert.alert("提示", `主题最多 ${MAX_TITLE_CHARS} 个字符`);
    if (cleaned.length < MIN_ITEMS)
      return Alert.alert("提示", `至少需要 ${MIN_ITEMS} 个选项`);
    if (cleaned.length > MAX_ITEMS)
      return Alert.alert("提示", `最多只能有 ${MAX_ITEMS} 个选项`);
    if (cleaned.some((s) => s.length > MAX_ITEM_CHARS))
      return Alert.alert("提示", `每个选项最多 ${MAX_ITEM_CHARS} 个字符`);
    setTitle(t);
    setItems(cleaned);
    setSelectedIdx(null);
    setEditorOpen(false);
  }

  const selectedSlice = selectedIdx != null ? slices[selectedIdx] : null;

  // Pointer geometry in container coordinates
  const circleTopY = wheelTopOffset + (cy - r);
  const tipY = circleTopY - POINTER_GAP;
  const baseY = tipY - POINTER_H;

  // Themed pointer & slice label colors
  const pointerFill = isDark ? "#FFFFFF" : "#111111";
  const pointerShadow = isDark ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.12)";
  const sliceLabel = isDark ? "#0B1220" : "#1F2937"; // keep dark text on pastel wedges
  const selectedStroke = isDark ? "#FFFFFF" : "#111111";
  const selectedDotFill = isDark ? "#FFFFFF" : "#111111";
  const selectedDotStroke = isDark ? "#111111" : "#FFFFFF";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <TopBar left="back" showNotice={true} />

      <View style={styles.titleContainer}>
        <AppText
          variant="headline"
          weight="900"
          align="center"
          style={[styles.titleText, { color: textColor }]}
        >
          {title}
        </AppText>
      </View>

      {/* Centered wheel area with extra height for the fixed pointer */}
      <View style={styles.centerArea}>
        <View style={{ width: size, height: containerH }}>
          {/* Fixed top pointer (does not rotate) */}
          <Svg
            width={size}
            height={containerH}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            {/* Soft shadow */}
            <Polygon
              points={`${cx},${tipY + 1} ${cx - POINTER_W / 2},${baseY + 1} ${
                cx + POINTER_W / 2
              },${baseY + 1}`}
              fill={pointerShadow}
            />
            {/* Solid pointer */}
            <Polygon
              points={`${cx},${tipY} ${cx - POINTER_W / 2},${baseY} ${
                cx + POINTER_W / 2
              },${baseY}`}
              fill={pointerFill}
              stroke={isDark ? "#1F2937" : "#ffffff"}
              strokeWidth={1.5}
            />
          </Svg>

          {/* Rotating wheel */}
          <Animated.View
            style={{
              position: "absolute",
              top: wheelTopOffset,
              left: 0,
              right: 0,
              transform: [
                {
                  rotate: rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <Svg width={size} height={size}>
              <G>
                {slices.map((s) => (
                  <G key={s.i}>
                    <Path
                      d={arcPath(cx, cy, r, s.start, s.end)}
                      fill={s.color}
                    />
                    <Path
                      d={`M ${cx} ${cy} L ${
                        cx + r * Math.cos(deg2rad(s.start))
                      } ${cy + r * Math.sin(deg2rad(s.start))}`}
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth={1}
                    />
                    <SvgText
                      x={s.lx}
                      y={s.ly}
                      fontSize={itemFontSize}
                      fontWeight="700"
                      fill={sliceLabel}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(${s.textRotation}, ${s.lx}, ${s.ly})`}
                    >
                      <TSpan>
                        {s.label.length > MAX_ITEM_CHARS
                          ? s.label.slice(0, MAX_ITEM_CHARS)
                          : s.label}
                      </TSpan>
                    </SvgText>
                  </G>
                ))}

                {/* Selected highlight */}
                {selectedSlice && (
                  <G>
                    <Path
                      d={arcPath(
                        cx,
                        cy,
                        r,
                        selectedSlice.start,
                        selectedSlice.end
                      )}
                      fill="none"
                      stroke={selectedStroke}
                      strokeWidth={3}
                    />
                    <Circle
                      cx={cx + (r - 6) * Math.cos(deg2rad(selectedSlice.mid))}
                      cy={cy + (r - 6) * Math.sin(deg2rad(selectedSlice.mid))}
                      r={5.5}
                      fill={selectedDotFill}
                      stroke={selectedDotStroke}
                      strokeWidth={1.5}
                    />
                  </G>
                )}

                {/* Center cap */}
                <Circle cx={cx} cy={cy} r={r * 0.18} fill="#fff" />
              </G>
            </Svg>
          </Animated.View>
        </View>
      </View>

      {/* Result + controls */}
      <View style={styles.bottomArea}>
        <View style={styles.resultWrap}>
          {selectedIdx == null ? (
            <Text style={[styles.resultHint, { color: muted }]}>
              点“开始”转一转
            </Text>
          ) : (
            <Text style={[styles.resultText, { color: textColor }]}>
              结果：{items[selectedIdx]}
            </Text>
          )}
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={handleSpin}
            disabled={spinning}
            style={({ pressed }) => [
              styles.spinBtn,
              {
                backgroundColor: primary,
                shadowColor: isDark ? "transparent" : "#000",
                elevation: isDark ? 0 : 2,
                opacity: pressed ? 0.96 : 1,
              },
              spinning && { opacity: 0.6 },
            ]}
          >
            <Ionicons name="sync" size={18} color="#111" />
            <Text style={[styles.spinText, { color: "#111" }]}>
              {spinning ? "正在旋转…" : "开始"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.editBtn,
              {
                backgroundColor: card,
                shadowColor: isDark ? "transparent" : "#000",
                elevation: isDark ? 0 : 2,
                borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
                borderColor: isDark ? border : "transparent",
              },
            ]}
            onPress={openEditor}
          >
            <Ionicons name="create-outline" size={18} color={textColor} />
            <Text style={[styles.editText, { color: textColor }]}>
              编辑转盘
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Editor modal */}
      <Modal
        animationType="slide"
        visible={editorOpen}
        onRequestClose={() => setEditorOpen(false)}
      >
        <SafeAreaView
          style={[styles.modalSafe, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => setEditorOpen(false)}
              style={styles.modalIconBtn}
            >
              <Ionicons name="close" size={22} color={textColor} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              编辑转盘
            </Text>
            <Pressable onPress={saveEditor} style={styles.modalIconBtn}>
              <Ionicons name="checkmark" size={24} color={textColor} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={[styles.label, { color: muted }]}>
              主题（≤ {MAX_TITLE_CHARS} 字）
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: card,
                  shadowColor: isDark ? "transparent" : "#000",
                  elevation: isDark ? 0 : 2,
                  borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
                  borderColor: isDark ? border : "transparent",
                },
              ]}
            >
              <TextInput
                value={draftTitle}
                onChangeText={(t) => setDraftTitle(t.slice(0, MAX_TITLE_CHARS))}
                placeholder="请输入主题"
                placeholderTextColor={muted}
                style={[styles.input, { color: textColor }]}
              />
              <Text style={[styles.counter, { color: muted }]}>
                {draftTitle.length}/{MAX_TITLE_CHARS}
              </Text>
            </View>

            <View style={{ height: 12 }} />
            <Text style={[styles.label, { color: muted }]}>
              选项（{MIN_ITEMS}–{MAX_ITEMS} 项，单项 ≤ {MAX_ITEM_CHARS} 字）
            </Text>

            {draftItems.map((it, idx) => (
              <View
                key={idx}
                style={[
                  styles.itemRow,
                  {
                    backgroundColor: card,
                    shadowColor: isDark ? "transparent" : "#000",
                    elevation: isDark ? 0 : 2,
                    borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
                    borderColor: isDark ? border : "transparent",
                  },
                ]}
              >
                <TextInput
                  value={it}
                  onChangeText={(t) => {
                    const copy = [...draftItems];
                    copy[idx] = t.slice(0, MAX_ITEM_CHARS);
                    setDraftItems(copy);
                  }}
                  placeholder={`选项 #${idx + 1}`}
                  placeholderTextColor={muted}
                  style={[styles.input, { flex: 1, color: textColor }]}
                />
                <Text style={[styles.counterSm, { color: muted }]}>
                  {it.length}/{MAX_ITEM_CHARS}
                </Text>
                <Pressable
                  style={[
                    styles.trashBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(220,38,38,0.15)"
                        : "rgba(204,0,0,0.06)",
                    },
                  ]}
                  onPress={() =>
                    setDraftItems(draftItems.filter((_, i) => i !== idx))
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={isDark ? "#ef4444" : "#c00"}
                  />
                </Pressable>
              </View>
            ))}

            <Pressable
              style={[
                styles.addBtn,
                {
                  backgroundColor: isDark ? `${primary}22` : "#E6FFFA",
                  borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
                  borderColor: isDark ? border : "transparent",
                },
                draftItems.length >= MAX_ITEMS && { opacity: 0.4 },
              ]}
              onPress={() => {
                if (draftItems.length >= MAX_ITEMS) return;
                setDraftItems((d) => [...d, `选项${d.length + 1}`]);
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={textColor} />
              <Text style={[styles.addText, { color: textColor }]}>
                添加一项
              </Text>
            </Pressable>

            <View
              style={[
                styles.tipBox,
                {
                  backgroundColor: card,
                  shadowColor: isDark ? "transparent" : "#000",
                  borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
                  borderColor: isDark ? border : "transparent",
                },
              ]}
            ></View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/** ---------- Styles (structure + spacing; colors are themed inline) ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },

  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomArea: {
    paddingBottom: 14,
  },

  resultWrap: { alignItems: "center" },
  resultHint: {},
  resultText: { fontSize: 16, fontWeight: "700" },

  controls: { alignItems: "center", marginTop: 12 },
  spinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 160,
    justifyContent: "center",
  },
  spinText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },

  editBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  editText: { fontSize: 13, fontWeight: "600" },

  // Modal
  modalSafe: { flex: 1 },
  modalHeader: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalIconBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  label: { fontSize: 13, marginBottom: 6, fontWeight: "600" },
  inputWrap: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 6,
  },
  input: { fontSize: 16, paddingVertical: 6 },
  counter: {
    position: "absolute",
    right: 12,
    bottom: 8,
    fontSize: 12,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    marginTop: 10,
    gap: 8,
  },
  counterSm: { fontSize: 11, width: 60, textAlign: "right" },
  trashBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addText: { fontSize: 13, fontWeight: "700" },
  tipBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },

  titleContainer: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  titleText: {
    fontWeight: "800",
    textAlign: "center",
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
