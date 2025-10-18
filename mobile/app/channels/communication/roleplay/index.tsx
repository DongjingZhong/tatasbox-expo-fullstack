// All comments in English only.
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
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Localization from "expo-localization";

import { useTheme } from "@/providers/ThemeProvider";
import TopBar from "@/components/ui/TopBar";
import StartNowBar from "@/components/home/StartNowBar";

function localeToLabel(tag: string | undefined) {
  if (!tag) return "English";
  const lower = tag.toLowerCase();

  // map by language prefix
  if (lower.startsWith("zh")) return "中文";
  if (lower.startsWith("en")) return "English";
  if (lower.startsWith("es")) return "Español";
  if (lower.startsWith("ja")) return "日本語";
  if (lower.startsWith("fr")) return "Français";
  if (lower.startsWith("de")) return "Deutsch";
  if (lower.startsWith("ko")) return "한국어";
  if (lower.startsWith("pt")) return "Português";
  if (lower.startsWith("it")) return "Italiano";

  // fallback to raw tag
  return tag;
}

export default function RoleplaySetupSimple() {
  const { colors, isDark } = useTheme();

  // Detect device language once
  const deviceLangTag =
    (Localization.getLocales && Localization.getLocales()[0]?.languageTag) ||
    (Localization as any).locale || // fallback for older SDKs
    "en";
  const defaultLang = useMemo(
    () => localeToLabel(deviceLangTag),
    [deviceLangTag]
  );

  // —— Basic fields ——
  const [aiRole, setAiRole] = useState("");
  const [meRole, setMeRole] = useState("");
  const [situation, setSituation] = useState("");
  const [language, setLanguage] = useState(defaultLang); // prefill with device language
  const [detail, setDetail] = useState(""); // optional

  const placeholder = isDark ? "#94A3B8" : "#64748B";
  const subtle = placeholder;

  const onConfirm = () => {
    const a = aiRole.trim();
    const m = meRole.trim();
    const s = situation.trim();

    if (!a || !m || !s) {
      Alert.alert("请完善信息", "请填写：AI 扮演的角色、你的角色、以及场景。");
      return;
    }

    router.push({
      pathname: "/channels/communication/roleplay/session",
      params: {
        aiRole: a,
        meRole: m,
        situation: s,
        language: language.trim(),
        detail: detail.trim(),
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
          keyboardShouldPersistTaps="handled"
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
              <ClearableInput
                value={situation}
                onChangeText={setSituation}
                placeholder="例如：求职面试 / 跟投资人路演"
                placeholderTextColor={placeholder}
                iconColor={subtle}
                containerStyle={styles.inputWrap}
                inputStyle={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: situation ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
                onClear={() => setSituation("")}
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
              <ClearableInput
                value={aiRole}
                onChangeText={setAiRole}
                placeholder="例如：面试官 / 投资者 / CEO"
                placeholderTextColor={placeholder}
                iconColor={subtle}
                containerStyle={styles.inputWrap}
                inputStyle={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: aiRole ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
                onClear={() => setAiRole("")}
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
              <ClearableInput
                value={meRole}
                onChangeText={setMeRole}
                placeholder="例如：求职者 / 创业者 / 产品经理"
                placeholderTextColor={placeholder}
                iconColor={subtle}
                containerStyle={styles.inputWrap}
                inputStyle={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: meRole ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
                onClear={() => setMeRole("")}
              />
            </View>

            {/* 使用语言（可选，默认本机语言） */}
            <View style={styles.block}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  使用语言
                </Text>
                <Text style={[styles.optional, { color: placeholder }]}>
                  可选
                </Text>
              </View>
              <ClearableInput
                value={language}
                onChangeText={setLanguage}
                placeholder="例如：中文 / English / Español"
                placeholderTextColor={placeholder}
                autoCapitalize="none"
                iconColor={subtle}
                containerStyle={styles.inputWrap}
                inputStyle={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: language ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
                onClear={() => setLanguage("")}
              />
              <Text style={[styles.hint, { color: placeholder, marginTop: 6 }]}>
                已为你预填本机语言（可修改）。
              </Text>
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

              <ClearableTextarea
                value={detail}
                onChangeText={setDetail}
                placeholder="粘贴职位/产品/会议背景等，AI 会据此更贴合地提问与反馈"
                placeholderTextColor={placeholder}
                iconColor={subtle}
                containerStyle={styles.textareaWrap}
                textareaStyle={[
                  styles.textarea,
                  {
                    backgroundColor: colors.card,
                    borderColor: detail ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
                onClear={() => setDetail("")}
              />

              <Text style={[styles.hint, { color: placeholder }]}>
                建议粘贴关键信息（职位要求、公司背景、场景要点、常见问题等），越具体越好。
              </Text>
            </View>
          </View>

          {/* —— CTA —— */}
          <StartNowBar variant="inline" onPress={onConfirm} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** A reusable single-line input with a small clear (×) button. */
function ClearableInput({
  value,
  onChangeText,
  onClear,
  inputStyle,
  containerStyle,
  iconColor = "#94A3B8",
  ...rest
}: TextInputProps & {
  onClear: () => void;
  inputStyle?: any;
  containerStyle?: any;
  iconColor?: string;
}) {
  return (
    <View style={[{ position: "relative" }, containerStyle]}>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        style={[inputStyle, { paddingRight: 36 }]} // leave space for the icon
      />
      {!!value && (
        <Pressable
          onPress={onClear}
          style={styles.clearBtn}
          hitSlop={12}
          accessibilityLabel="Clear input"
        >
          <Ionicons name="close-circle" size={16} color={iconColor} />
        </Pressable>
      )}
    </View>
  );
}

/** A reusable multiline textarea with a small clear (×) button. */
function ClearableTextarea({
  value,
  onChangeText,
  onClear,
  textareaStyle,
  containerStyle,
  iconColor = "#94A3B8",
  ...rest
}: TextInputProps & {
  onClear: () => void;
  textareaStyle?: any;
  containerStyle?: any;
  iconColor?: string;
}) {
  return (
    <View style={[{ position: "relative" }, containerStyle]}>
      <TextInput
        {...rest}
        multiline
        textAlignVertical="top"
        value={value}
        onChangeText={onChangeText}
        style={[textareaStyle, { paddingRight: 36 }]} // leave space for the icon
      />
      {!!value && (
        <Pressable
          onPress={onClear}
          style={styles.clearBtnMultiline}
          hitSlop={12}
          accessibilityLabel="Clear textarea"
        >
          <Ionicons name="close-circle" size={16} color={iconColor} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: { alignItems: "center", marginBottom: 32, marginTop: 8 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  formContainer: { gap: 20 },
  block: { gap: 10 },
  labelContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 15, fontWeight: "600" },
  required: { fontSize: 14, fontWeight: "600" },
  optional: { fontSize: 12, fontStyle: "italic" },

  inputWrap: { position: "relative" },
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

  textareaWrap: { position: "relative" },
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

  hint: { fontSize: 12, lineHeight: 16, marginTop: 6 },

  clearBtn: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  clearBtnMultiline: {
    position: "absolute",
    right: 10,
    top: 10,
  },
});
