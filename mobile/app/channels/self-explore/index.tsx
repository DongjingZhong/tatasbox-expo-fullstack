import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import TopBar from "@/components/ui/TopBar";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

type FieldName = "name" | "birthday" | "job" | "interests";
type FieldAnimations = { [key in FieldName]: Animated.Value };

export default function SelfExploreSetup() {
  const { isDark, colors } = useTheme();

  // ---------- Theme tokens ----------
  const t = useMemo(() => {
    const ACCENT = colors?.primary ?? "#6366F1";
    return {
      accent: ACCENT,
      success: "#10B981",
      error: "#EF4444",
      bg: isDark ? "#0B0F13" : "#F8FAFC",
      card: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
      cardBorder: isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB",
      text: isDark ? "#FFFFFF" : "#0F172A",
      textSub: isDark ? "#94A3B8" : "#64748B",
      label: isDark ? "#E2E8F0" : "#111827",
      inputBg: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
      inputBorder: isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0",
      inputBorderFocused: isDark ? ACCENT : ACCENT,
      inputText: isDark ? "#F1F5F9" : "#0F172A",
      deco: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.10)",
    };
  }, [isDark, colors]);

  // ---------- Form ----------
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [job, setJob] = useState("");
  const [interests, setInterests] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 头像
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const onPickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("需要权限", "请允许访问相册以选择照片");
      return;
    }

    const ipAny = ImagePicker as any;
    const pickerOptions: any = {
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    };
    if (ipAny?.MediaType?.Images) {
      pickerOptions.mediaTypes = [ipAny.MediaType.Images];
    }
    const res = await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!res.canceled && res.assets?.[0]?.uri) {
      setAvatarUri(res.assets[0].uri);
    }
  };

  // ---------- Animations ----------
  const saveButtonScale = useRef(new Animated.Value(1)).current;
  const saveButtonOpacity = useRef(new Animated.Value(1)).current;
  const fieldAnimationsRef = useRef<FieldAnimations>({
    name: new Animated.Value(0),
    birthday: new Animated.Value(0),
    job: new Animated.Value(0),
    interests: new Animated.Value(0),
  });
  const A = fieldAnimationsRef.current;

  const handleFocus = (field: FieldName) => {
    Animated.timing(A[field], {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const handleBlur = (field: FieldName) => {
    Animated.timing(A[field], {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // 重新设计的输入框样式 - 更干净、现代
  const getFieldStyle = (field: FieldName) => ({
    borderColor: A[field].interpolate({
      inputRange: [0, 1],
      outputRange: [t.inputBorder, t.inputBorderFocused],
    }),
    borderWidth: A[field].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    }),
    backgroundColor: t.inputBg,
    shadowColor: t.accent,
    shadowOpacity: A[field].interpolate({
      inputRange: [0, 1],
      outputRange: [0, isDark ? 0.15 : 0.08],
    }),
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    transform: [
      {
        translateY: A[field].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1],
        }),
      },
    ],
    elevation: A[field].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 2],
    }),
  });

  const animateButtonPress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(saveButtonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(saveButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(saveButtonOpacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(saveButtonOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const isFormValid =
    name.trim() && birthday.trim() && job.trim() && interests.trim();

  const onSave = async () => {
    const n = name.trim();
    const b = birthday.trim();
    const j = job.trim();
    const i = interests.trim();

    if (!n || !b || !j || !i) {
      Alert.alert("请完善信息", "请填写完所有字段后再保存");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b)) {
      Alert.alert("生日格式不正确", "请使用 YYYY-MM-DD 格式，如 1990-05-21");
      return;
    }

    animateButtonPress();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));

    router.push({
      pathname: "./home",
      params: { name: n, birthday: b, job: j, interests: i },
    });
  };

  // ---------- Styles ----------
  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: t.bg },
        container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },

        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        },
        titleContainer: { flex: 1 },
        title: {
          fontSize: 32,
          fontWeight: "800",
          color: t.text,
          marginBottom: 8,
          letterSpacing: -0.5,
        },
        subtitle: { fontSize: 16, color: t.textSub, fontWeight: "500" },

        // 头像
        avatarBtn: {
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: t.deco,
          borderWidth: 1.5,
          borderColor: t.cardBorder,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        avatarImage: { width: "100%", height: "100%" },

        formCard: {
          backgroundColor: t.card,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: t.cardBorder,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.2 : 0.04,
          shadowRadius: 8,
          elevation: 4,
        },
        formTitle: {
          fontSize: 20,
          fontWeight: "700",
          color: t.text,
          marginBottom: 8,
        },
        formDescription: {
          fontSize: 14,
          color: t.textSub,
          lineHeight: 20,
          marginBottom: 28,
        },

        field: { marginBottom: 28 },
        fieldHeader: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
        },
        fieldIcon: {
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: isDark
            ? "rgba(99,102,241,0.16)"
            : "rgba(99,102,241,0.10)",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
        },
        fieldIconText: { fontSize: 13, fontWeight: "500" },
        label: {
          color: t.label,
          fontSize: 15,
          fontWeight: "600",
          marginRight: 4,
        },
        required: { color: t.error, fontSize: 14, fontWeight: "600" },

        // 重新设计的输入框容器
        inputContainer: {
          borderRadius: 12,
          borderWidth: 1,
          paddingHorizontal: 16,
          overflow: "hidden",
          backgroundColor: t.inputBg,
        },
        input: {
          color: t.inputText,
          fontSize: 16,
          fontWeight: "500",
          paddingVertical: 14,
          minHeight: 48,
          // 去掉 RN Web 的默认黄色 outline
          outlineWidth: 0 as any,
          outlineStyle: "none" as any,
          outlineColor: "transparent" as any,
        },
        multilineContainer: { minHeight: 100 },
        multiline: {
          minHeight: 80,
          paddingTop: 14,
          textAlignVertical: "top",
        },
        hint: {
          fontSize: 12,
          color: t.textSub,
          marginTop: 8,
          fontStyle: "italic",
        },
        charHint: {
          fontSize: 12,
          color: t.textSub,
          textAlign: "right",
          marginTop: 6,
        },

        // 重新设计的保存按钮 - 更干净、清新
        saveButton: {
          borderRadius: 14,
          marginTop: 20,
          marginBottom: 8,
          overflow: "hidden",
          shadowColor: t.success,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.25 : 0.12,
          shadowRadius: 12,
          elevation: 4,
        },
        saveButtonInner: {
          backgroundColor: t.success,
          paddingVertical: 16,
          paddingHorizontal: 24,
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        },
        // 禁用态
        saveButtonInnerDisabled: {
          backgroundColor: isDark
            ? "rgba(16,185,129,0.4)"
            : "rgba(16,185,129,0.6)",
        },
        saveButtonDisabled: {
          shadowOpacity: isDark ? 0.1 : 0.06,
          elevation: 1,
        },
        saveButtonLoading: {
          shadowColor: isDark ? "#6EE7B7" : "#34D399",
          shadowOpacity: isDark ? 0.3 : 0.2,
        },

        saveButtonContent: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        },
        saveButtonIconContainer: {
          width: 20,
          height: 20,
          justifyContent: "center",
          alignItems: "center",
        },
        saveButtonText: {
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
        // 更细腻的按钮光泽效果
        buttonShine: {
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "60%",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.15)",
          transform: [{ skewX: "-15deg" }],
        },
        // 更细腻的边框光晕
        buttonGlow: {
          ...StyleSheet.absoluteFillObject,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.2)",
        },
        loadingSpinner: {
          width: 18,
          height: 18,
          justifyContent: "center",
          alignItems: "center",
        },
        spinnerInner: {
          width: 14,
          height: 14,
          borderRadius: 7,
          borderWidth: 1.5,
          borderColor: "#FFFFFF",
          borderTopColor: "transparent",
        },
        saveHint: {
          fontSize: 12,
          color: t.textSub,
          textAlign: "center",
          marginTop: 10,
          fontStyle: "italic",
        },
      }),
    [t, isDark]
  );

  const FieldIcon = ({ emoji }: { emoji: string }) => (
    <View style={styles.fieldIcon}>
      <Text style={styles.fieldIconText}>{emoji}</Text>
    </View>
  );

  const PLACEHOLDER = t.textSub;

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar left="back" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>自我探索</Text>
              <Text style={styles.subtitle}>开启内心对话之旅</Text>
            </View>

            {/* 头像 */}
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={onPickAvatar}
              activeOpacity={0.85}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons
                  name="camera"
                  size={22}
                  color={isDark ? "#CBD5E1" : "#475569"}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>基本资料</Text>
            <Text style={styles.formDescription}>
              告诉我们一些关于你的信息，让我们更好地为你提供个性化的探索体验
            </Text>

            {/* Name */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <FieldIcon emoji="👤" />
                <Text style={styles.label}>名字</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TouchableWithoutFeedback onPress={() => handleFocus("name")}>
                <Animated.View
                  style={[styles.inputContainer, getFieldStyle("name")]}
                >
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="请输入您的姓名"
                    placeholderTextColor={PLACEHOLDER}
                    style={styles.input}
                    returnKeyType="next"
                    onFocus={() => handleFocus("name")}
                    onBlur={() => handleBlur("name")}
                    cursorColor={t.accent}
                    selectionColor={
                      isDark ? "rgba(148,163,184,0.5)" : "rgba(99,102,241,0.25)"
                    }
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>

            {/* Birthday */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <FieldIcon emoji="🎂" />
                <Text style={styles.label}>生日</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TouchableWithoutFeedback onPress={() => handleFocus("birthday")}>
                <Animated.View
                  style={[styles.inputContainer, getFieldStyle("birthday")]}
                >
                  <TextInput
                    value={birthday}
                    onChangeText={setBirthday}
                    placeholder="YYYY-MM-DD（如 1995-07-16）"
                    placeholderTextColor={PLACEHOLDER}
                    style={styles.input}
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="next"
                    onFocus={() => handleFocus("birthday")}
                    onBlur={() => handleBlur("birthday")}
                    cursorColor={t.accent}
                    selectionColor={
                      isDark ? "rgba(148,163,184,0.5)" : "rgba(99,102,241,0.25)"
                    }
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
              <Text style={styles.hint}>
                我们将根据年龄提供更适合的探索内容
              </Text>
            </View>

            {/* Job */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <FieldIcon emoji="💼" />
                <Text style={styles.label}>当前职业</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TouchableWithoutFeedback onPress={() => handleFocus("job")}>
                <Animated.View
                  style={[styles.inputContainer, getFieldStyle("job")]}
                >
                  <TextInput
                    value={job}
                    onChangeText={setJob}
                    placeholder="例如：产品经理 / 学生 / 销售 / 自由职业者"
                    placeholderTextColor={PLACEHOLDER}
                    style={styles.input}
                    returnKeyType="next"
                    onFocus={() => handleFocus("job")}
                    onBlur={() => handleBlur("job")}
                    cursorColor={t.accent}
                    selectionColor={
                      isDark ? "rgba(148,163,184,0.5)" : "rgba(99,102,241,0.25)"
                    }
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>

            {/* Interests */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <FieldIcon emoji="🎯" />
                <Text style={styles.label}>兴趣爱好</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TouchableWithoutFeedback
                onPress={() => handleFocus("interests")}
              >
                <Animated.View
                  style={[
                    styles.inputContainer,
                    styles.multilineContainer,
                    getFieldStyle("interests"),
                  ]}
                >
                  <TextInput
                    value={interests}
                    onChangeText={setInterests}
                    placeholder="用逗号分隔：阅读, 跑步, 摄影, 音乐..."
                    placeholderTextColor={PLACEHOLDER}
                    style={[styles.input, styles.multiline]}
                    multiline
                    textAlignVertical="top"
                    maxLength={100}
                    onFocus={() => handleFocus("interests")}
                    onBlur={() => handleBlur("interests")}
                    cursorColor={t.accent}
                    selectionColor={
                      isDark ? "rgba(148,163,184,0.5)" : "rgba(99,102,241,0.25)"
                    }
                  />
                  <Text style={styles.charHint}>{interests.length}/100</Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>

            {/* 重新设计的保存按钮 */}
            <Animated.View
              style={[
                {
                  transform: [{ scale: saveButtonScale }],
                  opacity: saveButtonOpacity,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!isFormValid || isSaving) && styles.saveButtonDisabled,
                  isSaving && styles.saveButtonLoading,
                ]}
                onPress={onSave}
                disabled={!isFormValid || isSaving}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.saveButtonInner,
                    (!isFormValid || isSaving) &&
                      styles.saveButtonInnerDisabled,
                  ]}
                >
                  <View style={styles.saveButtonContent}>
                    <View style={styles.saveButtonIconContainer}>
                      {isSaving ? (
                        <View style={styles.loadingSpinner}>
                          <View style={styles.spinnerInner} />
                        </View>
                      ) : (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    <Text style={styles.saveButtonText}>
                      {isSaving ? "保存中..." : "保存资料"}
                    </Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.buttonShine,
                      {
                        opacity: saveButtonOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ]}
                  />
                </View>
                <View style={styles.buttonGlow} />
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.saveHint}>保存后可随时返回修改您的资料</Text>
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
