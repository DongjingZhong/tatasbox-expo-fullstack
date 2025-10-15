import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import TopBar from "@/components/ui/TopBar";
import StartNowBar from "@/components/home/StartNowBar";
import { Ionicons } from "@expo/vector-icons";

export default function RoleplaySetupSimple() {
  const { colors, isDark } = useTheme();

  // —— Basic fields ——
  const [aiRole, setAiRole] = useState("");
  const [meRole, setMeRole] = useState("");
  const [situation, setSituation] = useState("");
  const [language, setLanguage] = useState("");
  const [detail, setDetail] = useState(""); // 详细情景（可选）

  // —— Advanced persona (paid) ——
  // TODO: replace with real subscription check from your user profile / store
  const isPremium = false;
  const [advOpen, setAdvOpen] = useState(false); // 折叠开关

  const AI_TRAIT_OPTIONS = useMemo(
    () => [
      "刁钻挑剔",
      "泼辣犀利",
      "直来直去",
      "高要求",
      "严肃冷静",
      "逻辑至上",
      "苏格拉底式提问",
      "鼓励型",
      "幽默挖苦",
    ],
    []
  );

  const ME_TRAIT_OPTIONS = useMemo(
    () => [
      "幽默搞笑",
      "沉稳克制",
      "自信果断",
      "共情友善",
      "专业严谨",
      "机智反问",
      "简洁直给",
      "故事化表达",
    ],
    []
  );

  const [aiTraits, setAiTraits] = useState<string[]>([]);
  const [myTraits, setMyTraits] = useState<string[]>([]);
  const [customAiTraits, setCustomAiTraits] = useState("");
  const [customMyTraits, setCustomMyTraits] = useState("");

  const placeholder = isDark ? "#94A3B8" : "#64748B";

  const requirePremium = () => {
    Alert.alert(
      "高级定制未解锁",
      "设置“性格风格 / 回复风格”属于高级定制功能。开通后即可保存你的专属风格。",
      [
        { text: "以后再说", style: "cancel" },
        {
          text: "去开通",
          onPress: () => {
            try {
              router.push("/pricing");
            } catch {}
          },
        },
      ]
    );
  };

  const toggleTrait = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    if (!isPremium) {
      requirePremium();
      return;
    }
    setList(
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
    );
  };

  const splitCustom = (s: string) =>
    s
      .split(/[,\s，、]+/g)
      .map((x) => x.trim())
      .filter(Boolean);

  const onConfirm = () => {
    const a = aiRole.trim();
    const m = meRole.trim();
    const s = situation.trim();
    const l = language.trim();
    const d = detail.trim();

    if (!a || !m || !s) {
      Alert.alert("请完善信息", "请填写：AI 扮演的角色、你的角色、以及场景。");
      return;
    }

    // Only attach persona when premium
    const finalAiTraits = isPremium
      ? [...aiTraits, ...splitCustom(customAiTraits)].join("|")
      : "";
    const finalMyTraits = isPremium
      ? [...myTraits, ...splitCustom(customMyTraits)].join("|")
      : "";

    router.push({
      pathname: "/channels/communication/roleplay/session",
      params: {
        aiRole: a,
        meRole: m,
        situation: s,
        language: l,
        detail: d, // 详细情景传给会话页
        aiTraits: finalAiTraits,
        myTraits: finalMyTraits,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <TopBar left="back" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: placeholder }]}>
              配置你的角色扮演场景，开始沉浸式对话体验
            </Text>
          </View>

          {/* —— Base form —— */}
          <View style={styles.formContainer}>
            {/* 场景 */}
            <View style={styles.block}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: colors.text }]}>场景</Text>
                <Text style={[styles.required, { color: "#EF4444" }]}>*</Text>
              </View>
              <TextInput
                value={situation}
                onChangeText={setSituation}
                placeholder="例如：求职面试 / 跟投资人路演"
                placeholderTextColor={placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: situation ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>

            {/* AI 扮演 */}
            <View style={styles.block}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  AI 扮演的角色
                </Text>
                <Text style={[styles.required, { color: "#EF4444" }]}>*</Text>
              </View>
              <TextInput
                value={aiRole}
                onChangeText={setAiRole}
                placeholder="例如：面试官 / 投资者 / CEO"
                placeholderTextColor={placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: aiRole ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>

            {/* 我扮演 */}
            <View style={styles.block}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  我扮演的角色
                </Text>
                <Text style={[styles.required, { color: "#EF4444" }]}>*</Text>
              </View>
              <TextInput
                value={meRole}
                onChangeText={setMeRole}
                placeholder="例如：求职者 / 创业者 / 产品经理"
                placeholderTextColor={placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: meRole ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>

            {/* 使用语言 */}
            <View style={styles.block}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  使用语言
                </Text>
                <Text style={[styles.optional, { color: placeholder }]}>
                  可选
                </Text>
              </View>
              <TextInput
                value={language}
                onChangeText={setLanguage}
                placeholder="例如：普通话 / 英文 / 西班牙语"
                placeholderTextColor={placeholder}
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: language ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>

            {/* 详细情景（可选） */}
            <View style={styles.block}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  详细情景
                </Text>
                <Text style={[styles.optional, { color: placeholder }]}>
                  可选
                </Text>
              </View>
              <TextInput
                value={detail}
                onChangeText={setDetail}
                placeholder="粘贴招聘信息/产品文案/会议背景等，AI 会基于此进行更贴合的提问与反馈"
                placeholderTextColor={placeholder}
                multiline
                textAlignVertical="top"
                style={[
                  styles.textarea,
                  {
                    backgroundColor: colors.card,
                    borderColor: detail ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
              />
              <Text style={[styles.hint, { color: placeholder }]}>
                建议粘贴关键信息（职位要求、公司背景、场景要点、常见问题等），越具体越好。
              </Text>
            </View>
          </View>

          {/* —— Advanced persona (paid, collapsible) —— */}
          <View
            style={[
              styles.paidSection,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* 折叠标题行（常显） */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setAdvOpen((v) => !v)}
              style={({ pressed }) => [
                styles.paidHeader,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={styles.paidTitleRow}>
                <Text style={[styles.paidTitle, { color: colors.text }]}>
                  高级定制（付费）
                </Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>

              <View style={styles.paidActionsRow}>
                {!isPremium && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      requirePremium();
                    }}
                    style={({ pressed }) => [
                      styles.upgradeBtn,
                      {
                        borderColor: colors.primary,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.upgradeText, { color: colors.primary }]}
                    >
                      开通
                    </Text>
                  </Pressable>
                )}
                <Ionicons
                  name={advOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={isDark ? "#E5E7EB" : "#6B7280"}
                />
              </View>
            </Pressable>

            {/* 折叠内容 */}
            {advOpen && (
              <View style={styles.collapseBody}>
                {/* AI 性格风格 */}
                <View style={styles.block}>
                  <Text style={[styles.subLabel, { color: colors.text }]}>
                    AI 的性格风格
                  </Text>
                  <View style={styles.chipWrap}>
                    {AI_TRAIT_OPTIONS.map((t) => {
                      const active = aiTraits.includes(t);
                      return (
                        <Pressable
                          key={t}
                          onPress={() => toggleTrait(aiTraits, setAiTraits, t)}
                          disabled={!isPremium}
                          style={({ pressed }) => [
                            styles.chip,
                            {
                              borderColor: active
                                ? colors.primary
                                : colors.border,
                              backgroundColor: active
                                ? isDark
                                  ? "#0B1220"
                                  : "#F1F5FF"
                                : "transparent",
                              opacity: !isPremium ? 0.6 : pressed ? 0.85 : 1,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: active ? colors.primary : colors.text },
                            ]}
                          >
                            {t}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <TextInput
                    value={customAiTraits}
                    onChangeText={(v) => {
                      if (!isPremium) return requirePremium();
                      setCustomAiTraits(v);
                    }}
                    placeholder="自定义（用逗号分隔）：如 刁钻，泼辣，讲话犀利"
                    placeholderTextColor={placeholder}
                    editable={isPremium}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        borderColor: isPremium ? colors.primary : colors.border,
                        color: colors.text,
                        opacity: isPremium ? 1 : 0.6,
                      },
                    ]}
                  />
                </View>

                {/* 我的回复风格 */}
                <View style={styles.block}>
                  <Text style={[styles.subLabel, { color: colors.text }]}>
                    我的回复风格
                  </Text>
                  <View style={styles.chipWrap}>
                    {ME_TRAIT_OPTIONS.map((t) => {
                      const active = myTraits.includes(t);
                      return (
                        <Pressable
                          key={t}
                          onPress={() => toggleTrait(myTraits, setMyTraits, t)}
                          disabled={!isPremium}
                          style={({ pressed }) => [
                            styles.chip,
                            {
                              borderColor: active
                                ? colors.primary
                                : colors.border,
                              backgroundColor: active
                                ? isDark
                                  ? "#0B1220"
                                  : "#F1F5FF"
                                : "transparent",
                              opacity: !isPremium ? 0.6 : pressed ? 0.85 : 1,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: active ? colors.primary : colors.text },
                            ]}
                          >
                            {t}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <TextInput
                    value={customMyTraits}
                    onChangeText={(v) => {
                      if (!isPremium) return requirePremium();
                      setCustomMyTraits(v);
                    }}
                    placeholder="自定义（用逗号分隔）：如 搞笑幽默，简洁直接"
                    placeholderTextColor={placeholder}
                    editable={isPremium}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        borderColor: isPremium ? colors.primary : colors.border,
                        color: colors.text,
                        opacity: isPremium ? 1 : 0.6,
                      },
                    ]}
                  />

                  <Text style={[styles.hint, { color: placeholder }]}>
                    小提示：开通后你选择的风格会传入会话，让 AI
                    以该风格提问/回应；
                    “我的回复风格”也会用于生成建议或改写提示。
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* —— 行为按钮（放在所有内容末尾，随内容滚动） —— */}
          <StartNowBar
            variant="inline"
            onPress={onConfirm}
            // 可按需调整大小：size={88}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40, // ↓ inline 按钮无需太大底部留白
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: { gap: 20 },
  block: { gap: 10 },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: { fontSize: 15, fontWeight: "600" },
  required: { fontSize: 14, fontWeight: "600" },
  optional: { fontSize: 12, fontStyle: "italic" },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    fontSize: 16,
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  textarea: {
    minHeight: 140,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1.5,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },

  // Paid section styles
  paidSection: {
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  paidHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 4,
  },
  paidTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  paidActionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  paidTitle: { fontSize: 16, fontWeight: "700" },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#111827",
    borderRadius: 999,
  },
  proBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
  },
  upgradeText: { fontSize: 12, fontWeight: "700" },

  // Chips
  subLabel: { fontSize: 14, fontWeight: "700" },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontWeight: "600" },

  hint: { fontSize: 12, lineHeight: 16, marginTop: 6 },

  // 折叠容器
  collapseBody: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(148,163,184,0.25)",
    gap: 16,
  },
});
