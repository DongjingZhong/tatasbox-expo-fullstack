// All code comments in English only.

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Alert,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";

import TopBar from "@/components/ui/TopBar";
import AppText from "@/components/ui/AppText";
import { useTheme } from "@/providers/ThemeProvider";
import { useGoals } from "@/src/store/useGoals";
import { useAuthProfile } from "@/src/store/useAuthProfile";

type ViewMode = "pending" | "done";
const MAX_LEN = 300;

export default function GoalsScreen() {
  const { isDark } = useTheme();
  const { width: W, height: H } = useWindowDimensions();

  // Adaptive rectangular card size
  const CARD_W = Math.min(Math.max(320, W - 48), 480);
  const CARD_H = Math.min(H * 0.7, 560);
  const IMAGE_H = Math.min(Math.max(180, CARD_H * 0.45), 280);

  // Profile
  const profile = useAuthProfile((s) => s.profile);
  const name = profile?.name?.trim() || "朋友";

  // Store
  const {
    hydrated,
    hydrate,
    goals,
    addGoal,
    toggleDone,
    removeGoal,
    setImage,
    updateText,
  } = useGoals();

  const [mode, setMode] = useState<ViewMode>("pending");

  // Creation modal
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftImage, setDraftImage] = useState<string | undefined>(undefined);

  // Edit modal (non-transparent)
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Deck + horizontal-only swipe (left = previous, right = next)
  const pan = useRef(new Animated.ValueXY()).current;
  const [index, setIndex] = useState(0);
  const SWIPE_X = 120;

  // Celebration
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsGoal, setCongratsGoal] = useState("");
  const congratsScale = useRef(new Animated.Value(0.9)).current;
  const congratsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  // Filter by tab
  const source = useMemo(() => {
    const list =
      mode === "pending"
        ? goals.filter((g) => !g.done)
        : goals.filter((g) => g.done);
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  }, [goals, mode]);

  // Reset index when data changes
  useEffect(() => {
    setIndex(0);
    pan.setValue({ x: 0, y: 0 });
  }, [mode, goals, pan]);

  const nextCard = useCallback(() => {
    setIndex((i) => Math.min(i + 1, Math.max(source.length - 1, 0)));
    pan.setValue({ x: 0, y: 0 });
  }, [source.length, pan]);

  const prevCard = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
    pan.setValue({ x: 0, y: 0 });
  }, [pan]);

  // Horizontal-only responder
  const responder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: Animated.event([null, { dx: pan.x }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          const atLast = index >= source.length - 1;
          const atFirst = index <= 0;

          if (g.dx > SWIPE_X && !atLast) {
            Animated.timing(pan, {
              toValue: { x: 500, y: 0 },
              duration: 200,
              useNativeDriver: true,
            }).start(nextCard);
          } else if (g.dx < -SWIPE_X && !atFirst) {
            Animated.timing(pan, {
              toValue: { x: -500, y: 0 },
              duration: 200,
              useNativeDriver: true,
            }).start(prevCard);
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              friction: 6,
            }).start();
          }
        },
      }),
    [pan, index, source.length, nextCard, prevCard]
  );

  // Rotation feedback
  const rotate = pan.x.interpolate({
    inputRange: [-250, 0, 250],
    outputRange: ["-4deg", "0deg", "4deg"],
  });

  const current = source[index];

  // Modals open/close
  const openCreate = () => setShowCreate(true);
  const closeCreate = () => {
    setShowCreate(false);
    setDraft("");
    setDraftImage(undefined);
  };

  const confirmCreate = async () => {
    const t = draft.trim();
    if (!t) return Alert.alert("请填写目标内容");
    if (t.length > MAX_LEN)
      return Alert.alert("超过字数限制", `最多 ${MAX_LEN} 字符。`);
    await addGoal(t, draftImage);
    closeCreate();
    setMode("pending");
  };

  // Edit helpers
  const openEdit = (id: string, text: string) => {
    setEditId(id);
    setEditText(text);
    setShowEdit(true);
  };
  const closeEdit = () => {
    setShowEdit(false);
    setEditId(null);
    setEditText("");
  };
  const confirmEdit = async () => {
    if (!editId) return;
    const t = editText.trim();
    if (!t) return Alert.alert("请填写目标内容");
    if (t.length > MAX_LEN)
      return Alert.alert("超过字数限制", `最多 ${MAX_LEN} 字符。`);
    await updateText(editId, t);
    closeEdit();
  };

  // Pick images
  const pickImageForCurrent = async () => {
    if (!current) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("权限不足", "需要相册权限以选择图片。");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      aspect: [4, 3],
      allowsEditing: true,
    });
    if (!res.canceled) await setImage(current.id, res.assets?.[0]?.uri);
  };
  const pickImageForDraft = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("权限不足", "需要相册权限以选择图片。");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      aspect: [4, 3],
      allowsEditing: true,
    });
    if (!res.canceled) setDraftImage(res.assets?.[0]?.uri);
  };

  // Toggle done with confirmation
  const handleConfirmToggle = () => {
    if (!current) return;
    if (!current.done) {
      Alert.alert("你已经完成这个目标了吗？", "", [
        { text: "取消", style: "cancel" },
        {
          text: "是的",
          onPress: async () => {
            await toggleDone(current.id);
            openCongrats(current.text);
          },
        },
      ]);
    } else {
      Alert.alert("要标记为未完成吗？", "", [
        { text: "取消", style: "cancel" },
        { text: "好的", onPress: () => toggleDone(current.id) },
      ]);
    }
  };

  // Delete
  const handleDelete = () => {
    if (!current) return;
    Alert.alert("删除目标", "确定要删除这个目标吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          await removeGoal(current.id);
          setIndex((i) => Math.max(Math.min(i, source.length - 2), 0));
        },
      },
    ]);
  };

  // Celebration modal anim
  const openCongrats = (goalText: string) => {
    setCongratsGoal(goalText);
    setShowCongrats(true);
    congratsScale.setValue(0.9);
    congratsOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(congratsScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }),
      Animated.timing(congratsOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const closeCongrats = () => {
    Animated.parallel([
      Animated.timing(congratsOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(congratsScale, {
        toValue: 0.95,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCongrats(false));
  };

  const formatCN = (ms: number) => {
    const d = new Date(ms);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const displayIndex = source.length ? index + 1 : 0;
  const total = source.length;
  const modeLabel = mode === "pending" ? "未完成" : "已完成";

  // Card visual styles based on theme
  const cardBg = isDark
    ? "rgba(17,24,39,0.55)" /* slate-900 @55% */
    : "rgba(255,255,255,0.75)";
  const cardBorder = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.06)";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Beautiful page gradient background */}
      <LinearGradient
        colors={
          isDark
            ? ["#0B1220", "#0E1630", "#1F2937"]
            : ["#FFF7ED", "#E0EAFF", "#E0F2FE"]
        }
        start={{ x: 0.05, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <TopBar title={<AppText weight="800">我的目标</AppText>} />

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <BlurView
          intensity={30}
          tint={isDark ? "dark" : "light"}
          style={styles.tabsBlur}
        >
          <Pressable
            onPress={() => setMode("pending")}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  mode === "pending"
                    ? isDark
                      ? "#111827AA"
                      : "#FFFFFFCC"
                    : "transparent",
              },
            ]}
          >
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={isDark ? "#E5E7EB" : "#111827"}
            />
            <AppText
              weight="700"
              style={{ color: isDark ? "#E5E7EB" : "#111827" }}
            >
              未完成
            </AppText>
            <AppText variant="caption" muted>
              {" "}
              {goals.filter((g) => !g.done).length}{" "}
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setMode("done")}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  mode === "done"
                    ? isDark
                      ? "#111827AA"
                      : "#FFFFFFCC"
                    : "transparent",
              },
            ]}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={16}
              color={isDark ? "#E5E7EB" : "#111827"}
            />
            <AppText
              weight="700"
              style={{ color: isDark ? "#E5E7EB" : "#111827" }}
            >
              已完成
            </AppText>
            <AppText variant="caption" muted>
              {" "}
              {goals.filter((g) => g.done).length}{" "}
            </AppText>
          </Pressable>
        </BlurView>
      </View>

      {/* Deck area */}
      <View style={styles.deckArea}>
        {!current && (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <AppText
              style={{
                textAlign: "center",
                color: isDark ? "#E5E7EB" : "#111827",
              }}
            >
              Hi，{name}，永远不要忘记你的目标，永远不要忘记你想成为的人。
              创建你的目标，然后默默实现它；当你实现之后，再点击「已完成」。
            </AppText>

            {/* Round create button */}
            <IconCircleButton
              icon="add"
              onPress={openCreate}
              colors={["#F59E0B", "#F97316"] as const}
              glowColor="#F59E0B"
              style={{ marginTop: 16 }}
              size={56}
            />
          </View>
        )}

        {/* Current card with glow/shadow + semi-transparent glass */}
        {current && (
          <Animated.View
            {...responder.panHandlers}
            style={[
              {
                width: CARD_W,
                height: CARD_H,
                transform: [{ translateX: pan.x }, { rotate }],
                alignSelf: "center",
                zIndex: 50,
                elevation: isDark ? 12 : 8,
              },
              isDark
                ? {
                    // glow in dark mode
                    shadowColor: "#60A5FA",
                    shadowOpacity: 0.45,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 10 },
                  }
                : {
                    // soft shadow in light mode
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                  },
            ]}
          >
            <BlurView
              intensity={30}
              tint={isDark ? "dark" : "light"}
              style={styles.cardBlur}
            >
              <View
                style={[
                  styles.cardSolid,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
              >
                {/* Status (left) */}
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: current.done ? "#DCFCE7" : "#FEF3C7" },
                  ]}
                >
                  <AppText
                    weight="700"
                    style={{ color: current.done ? "#16A34A" : "#D97706" }}
                  >
                    {current.done ? "已完成" : "未完成"}
                  </AppText>
                </View>

                {/* Counter (right) */}
                <View style={styles.counterWrap}>
                  <LinearGradient
                    colors={
                      isDark ? ["#A7F3D0", "#93C5FD"] : ["#FDE68A", "#A7F3D0"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.counterBg}
                  >
                    <AppText
                      weight="800"
                      style={{ color: isDark ? "#0B1220" : "#111827" }}
                    >
                      {displayIndex}/{total} {modeLabel}
                    </AppText>
                  </LinearGradient>
                </View>

                {/* Top image */}
                <View style={{ position: "relative" }}>
                  {current.image ? (
                    <Image
                      source={{ uri: current.image }}
                      style={{ width: "100%", height: IMAGE_H }}
                    />
                  ) : (
                    <LinearGradient
                      colors={
                        isDark ? ["#0EA5E9", "#7C3AED"] : ["#FDE68A", "#F59E0B"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: "100%",
                        height: IMAGE_H,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="flag-outline"
                        size={48}
                        color={isDark ? "#ffffff" : "#111827"}
                      />
                    </LinearGradient>
                  )}

                  {/* Change image */}
                  <Pressable
                    onPress={pickImageForCurrent}
                    style={({ pressed }) => [
                      styles.editImageBtn,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Ionicons name="image-outline" size={16} color="#fff" />
                    <AppText weight="700" style={{ color: "#fff" }}>
                      更换图片
                    </AppText>
                  </Pressable>

                  {/* Edit text */}
                  <Pressable
                    onPress={() => openEdit(current.id, current.text)}
                    style={({ pressed }) => [
                      styles.editBtn,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Ionicons name="pencil" size={16} color="#111827" />
                    <AppText weight="700" style={{ color: "#111827" }}>
                      编辑
                    </AppText>
                  </Pressable>
                </View>

                {/* Text area */}
                <View style={{ flex: 1, padding: 14 }}>
                  <AppText variant="caption" muted>
                    创建时间：{formatCN(current.createdAt)}
                  </AppText>

                  <ScrollView style={{ flex: 1, marginTop: 6 }}>
                    <AppText style={{ color: isDark ? "#E5E7EB" : "#111827" }}>
                      {current.text}
                    </AppText>
                  </ScrollView>
                </View>

                {/* Bottom round icon buttons: Delete | Check (bigger) | Create */}
                <View style={styles.cardActionsRow}>
                  <IconCircleButton
                    icon="trash"
                    onPress={handleDelete}
                    colors={["#F87171", "#EF4444"] as const}
                    glowColor="#EF4444"
                    size={54}
                  />
                  <IconCircleButton
                    icon="checkmark"
                    onPress={handleConfirmToggle}
                    colors={["#34D399", "#10B981"] as const}
                    glowColor="#10B981"
                    size={66} // bigger center button
                  />
                  <IconCircleButton
                    icon="add"
                    onPress={openCreate}
                    colors={["#F59E0B", "#F97316"] as const}
                    glowColor="#F59E0B"
                    size={54}
                  />
                </View>
              </View>
            </BlurView>
          </Animated.View>
        )}
      </View>

      {/* Create modal - NOT transparent */}
      <Modal
        animationType="slide"
        visible={showCreate}
        onRequestClose={closeCreate}
      >
        <SafeAreaView style={styles.fullModal}>
          <LinearGradient
            colors={
              isDark
                ? ["#0B1220", "#111827", "#0F172A"]
                : ["#FFF7ED", "#E0EAFF", "#E0F2FE"]
            }
            start={{ x: 0.05, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.modalCardSolid,
              {
                backgroundColor: isDark
                  ? "rgba(17,24,39,0.7)"
                  : "rgba(255,255,255,0.9)",
                borderColor: isDark ? "#374151" : "#E5E7EB",
              },
            ]}
          >
            <AppText
              weight="800"
              style={{ marginBottom: 8, color: isDark ? "#E5E7EB" : "#111827" }}
            >
              新建目标
            </AppText>

            <Pressable
              onPress={pickImageForDraft}
              style={({ pressed }) => [
                styles.modalImageWrap,
                { opacity: pressed ? 0.9 : 1, height: IMAGE_H - 40 },
              ]}
            >
              {draftImage ? (
                <Image source={{ uri: draftImage }} style={styles.modalImage} />
              ) : (
                <LinearGradient
                  colors={["#0EA5E9", "#7C3AED"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalImage}
                >
                  <Ionicons name="image-outline" size={42} color="#fff" />
                  <AppText muted>点击添加图片</AppText>
                </LinearGradient>
              )}
            </Pressable>

            <View style={styles.inputBox}>
              <TextInput
                value={draft}
                onChangeText={(t) => t.length <= MAX_LEN && setDraft(t)}
                placeholder="写下你清晰可执行的目标（最多 300 字）"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.modalInput,
                  { color: isDark ? "#E5E7EB" : "#111827", minHeight: 140 },
                ]}
                multiline
              />
              <AppText
                variant="caption"
                muted
                style={{ alignSelf: "flex-end" }}
              >
                {draft.length}/{MAX_LEN}
              </AppText>
            </View>

            <View style={{ height: 10 }} />
            <View style={styles.modalActions}>
              {/* High-contrast cancel button */}
              <Pressable
                onPress={closeCreate}
                style={({ pressed }) => [
                  styles.modalBtn,
                  {
                    backgroundColor: isDark
                      ? pressed
                        ? "#D1D5DB"
                        : "#E5E7EB"
                      : pressed
                      ? "#E5E7EB"
                      : "#F3F4F6",
                    borderWidth: 1,
                    borderColor: isDark ? "#CBD5E1" : "#E5E7EB",
                  },
                ]}
              >
                <AppText weight="700" style={{ color: "#111827" }}>
                  取消
                </AppText>
              </Pressable>

              <Pressable
                onPress={confirmCreate}
                style={({ pressed }) => [
                  styles.modalBtn,
                  { backgroundColor: pressed ? "#EA580C" : "#F97316" },
                ]}
              >
                <AppText style={{ color: "#fff" }} weight="700">
                  保存
                </AppText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit modal - NOT transparent (kept) */}
      <Modal
        animationType="slide"
        visible={showEdit}
        onRequestClose={closeEdit}
      >
        <SafeAreaView style={styles.fullModal}>
          <LinearGradient
            colors={
              isDark
                ? ["#0B1220", "#111827", "#0F172A"]
                : ["#FFF7ED", "#E0EAFF", "#E0F2FE"]
            }
            start={{ x: 0.05, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.modalCardSolid,
              {
                backgroundColor: isDark
                  ? "rgba(17,24,39,0.7)"
                  : "rgba(255,255,255,0.95)",
                borderColor: isDark ? "#374151" : "#E5E7EB",
              },
            ]}
          >
            <AppText
              weight="800"
              style={{ marginBottom: 8, color: isDark ? "#E5E7EB" : "#111827" }}
            >
              编辑目标
            </AppText>
            <TextInput
              value={editText}
              onChangeText={(t) => t.length <= MAX_LEN && setEditText(t)}
              placeholder="更新你的目标内容（最多 300 字）"
              placeholderTextColor="#9CA3AF"
              style={[
                styles.modalInput,
                { color: isDark ? "#E5E7EB" : "#111827", minHeight: 140 },
              ]}
              multiline
            />
            <AppText variant="caption" muted style={{ alignSelf: "flex-end" }}>
              {editText.length}/{MAX_LEN}
            </AppText>

            <View style={{ height: 10 }} />
            <View style={styles.modalActions}>
              <Pressable
                onPress={closeEdit}
                style={({ pressed }) => [
                  styles.modalBtn,
                  {
                    backgroundColor: isDark
                      ? pressed
                        ? "#D1D5DB"
                        : "#E5E7EB"
                      : pressed
                      ? "#E5E7EB"
                      : "#F3F4F6",
                    borderWidth: 1,
                    borderColor: isDark ? "#CBD5E1" : "#E5E7EB",
                  },
                ]}
              >
                <AppText weight="700" style={{ color: "#111827" }}>
                  取消
                </AppText>
              </Pressable>
              <Pressable
                onPress={confirmEdit}
                style={({ pressed }) => [
                  styles.modalBtn,
                  { backgroundColor: pressed ? "#EA580C" : "#F97316" },
                ]}
              >
                <AppText style={{ color: "#fff" }} weight="700">
                  保存
                </AppText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Celebration modal - NOT transparent now */}
      <Modal
        animationType="fade"
        visible={showCongrats}
        onRequestClose={closeCongrats}
      >
        <SafeAreaView style={styles.fullModal}>
          <LinearGradient
            colors={
              isDark
                ? ["#052e2b", "#0B1220", "#111827"]
                : ["#FEF9C3", "#DCFCE7", "#E0F2FE"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.modalCardSolid,
              {
                backgroundColor: isDark
                  ? "rgba(17,24,39,0.7)"
                  : "rgba(255,255,255,0.95)",
              },
            ]}
          >
            <LinearGradient
              colors={isDark ? ["#10B981", "#22D3EE"] : ["#FDE68A", "#86EFAC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.congratsHeader}
            >
              <Ionicons
                name="trophy"
                size={40}
                color={isDark ? "#0B1220" : "#111827"}
              />
            </LinearGradient>

            <Animated.View
              style={{
                padding: 16,
                transform: [{ scale: congratsScale }],
                opacity: congratsOpacity,
              }}
            >
              <AppText
                weight="800"
                style={{
                  fontSize: 18,
                  textAlign: "center",
                  color: isDark ? "#E5E7EB" : "#111827",
                }}
              >
                🎉 恭喜你完成目标！
              </AppText>
              {!!congratsGoal && (
                <AppText
                  style={{
                    textAlign: "center",
                    marginTop: 8,
                    color: isDark ? "#E5E7EB" : "#111827",
                  }}
                >
                  “{congratsGoal}”
                </AppText>
              )}
              <AppText muted style={{ textAlign: "center", marginTop: 8 }}>
                好样的！继续保持，一点一滴把理想的自己活出来。
              </AppText>

              <Pressable
                onPress={closeCongrats}
                style={({ pressed }) => [
                  styles.modalBtn,
                  {
                    marginTop: 14,
                    backgroundColor: pressed ? "#EA580C" : "#F97316",
                    alignSelf: "center",
                    minWidth: 120,
                  },
                ]}
              >
                <AppText
                  weight="700"
                  style={{ color: "#fff", textAlign: "center" }}
                >
                  继续
                </AppText>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/** ---------- Round Gradient Icon Button ---------- */
function IconCircleButton({
  icon,
  onPress,
  colors,
  glowColor,
  size = 52,
  style,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: readonly [string, string];
  glowColor: string;
  size?: number;
  style?: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.9 : 1,
          shadowColor: glowColor,
          shadowOpacity: 0.65,
          shadowRadius: Math.max(10, size / 3),
          shadowOffset: { width: 0, height: Math.round(size / 6) },
          elevation: 8,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={Math.round(size * 0.46)} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}

/** ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1 },

  tabsWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    zIndex: 1,
    elevation: 1,
    position: "relative",
  },
  tabsBlur: {
    flexDirection: "row",
    gap: 10,
    padding: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  deckArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Glass card shell
  cardBlur: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  // Opaque/semi card
  cardSolid: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    position: "relative",
  },

  statusPill: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  counterWrap: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  counterBg: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  editImageBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  editBtn: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  emptyCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },

  // Shared modal styles
  fullModal: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalCardSolid: {
    width: "90%",
    maxWidth: 520,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalImageWrap: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  modalImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  inputBox: { gap: 6 },
  modalInput: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },

  // Congrats section inside non-transparent modal
  congratsHeader: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
});
