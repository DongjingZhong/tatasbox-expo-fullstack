// All comments in English only.
import React, { useMemo, useState, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useAuthProfile } from "@/src/store/useAuthProfile";
import { Capability, isProfileComplete } from "@/src/types/profile";
import { useTheme } from "@/providers/ThemeProvider";
import AppText from "@/components/ui/AppText";

type Mode = "setup" | "edit";

export default function ProfileForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { isDark } = useTheme();

  // Stable selectors to avoid re-subscribe loops
  const profile = useAuthProfile((s) => s.profile);
  const setProfile = useAuthProfile((s) => s.setProfile);

  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar ?? "");
  const [capability, setCapability] = useState<Capability>(
    profile?.capability ?? "decision"
  );
  const [customCap, setCustomCap] = useState(profile?.customCapability ?? "");
  const [job, setJob] = useState(profile?.job ?? "");
  const [interests, setInterests] = useState(
    (profile?.interests ?? []).join(", ")
  );
  const [birthday, setBirthday] = useState(profile?.birthday ?? "");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Refs for keyboard handling
  const scrollViewRef = useRef<ScrollView>(null);
  const interestsInputRef = useRef<RNTextInput>(null);
  const birthdayInputRef = useRef<RNTextInput>(null);
  const jobInputRef = useRef<RNTextInput>(null);

  // Enhanced theme tokens with better color hierarchy
  const t = useMemo(() => {
    return {
      bg: isDark ? "#0B1020" : "#F8FAFC",
      card: isDark ? "#0F172A" : "#FFFFFF",
      border: isDark ? "#334155" : "#E2E8F0",
      borderFocus: isDark ? "#3B82F6" : "#2563EB",
      inputBg: isDark ? "#1E293B" : "#FFFFFF",
      inputText: isDark ? "#F1F5F9" : "#0F172A",
      placeholder: isDark ? "#64748B" : "#94A3B8",
      chipBg: isDark ? "#1E293B" : "#F1F9FF",
      chipOnBg: isDark ? "#3B82F6" : "#2563EB",
      chipText: isDark ? "#CBD5E1" : "#475569",
      chipOnText: "#FFFFFF",
      btnBg: isDark ? "#3B82F6" : "#2563EB",
      btnText: "#FFFFFF",
      label: isDark ? "#E2E8F0" : "#475569",
      subtitle: isDark ? "#94A3B8" : "#64748B",
    };
  }, [isDark]);

  // Use new ImagePicker MediaType API: only allow images
  const pickAvatar = async () => {
    // Ask for media library permission (recommended)
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("需要相册权限", "请到系统设置中允许访问照片。");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      // New API: use 'images' instead of deprecated MediaTypeOptions.Images
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      // allowsMultipleSelection defaults to false; keep single image selection
    });

    if (!res.canceled && Array.isArray(res.assets) && res.assets.length > 0) {
      const uri = res.assets[0]?.uri;
      if (uri) setAvatar(uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setBirthday(formattedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const onSave = async () => {
    const cleanInterests = interests
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await setProfile({
      name,
      avatar,
      capability,
      customCapability: capability === "custom" ? customCap : undefined,
      job,
      interests: cleanInterests,
      birthday,
    });

    const ok = isProfileComplete({
      name,
      avatar,
      capability,
      customCapability: capability === "custom" ? customCap : undefined,
      job,
      interests: cleanInterests,
      birthday,
    });

    if (!ok) {
      Alert.alert("请完善资料", "头像、名字、能力、工作、兴趣、生日为必填。");
      return;
    }

    if (mode === "setup") router.replace("/channels");
    else router.back();
  };

  // Handle input focus for keyboard avoidance
  const handleInputFocus = (inputRef: React.RefObject<RNTextInput | null>) => {
    setTimeout(() => {
      inputRef.current?.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({
          y: pageY - 100, // Scroll to show input with some padding
          animated: true,
        });
      });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.wrap}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText weight="bold" style={[styles.h1, { color: t.inputText }]}>
            {mode === "setup" ? "完善个人资料" : "编辑个人资料"}
          </AppText>
          <AppText style={[styles.sub, { color: t.subtitle }]}>
            这些信息仅用于为你定制体验，随时可修改。
          </AppText>
        </View>

        {/* Avatar Section */}
        <View style={styles.section}>
          <Label color={t.label}>头像</Label>
          <Pressable
            onPress={pickAvatar}
            style={[styles.avatarContainer, { borderColor: t.border }]}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: t.chipBg },
                ]}
              >
                <AppText style={[styles.avatarText, { color: t.subtitle }]}>
                  点击上传头像
                </AppText>
              </View>
            )}
            <View
              style={[
                styles.avatarOverlay,
                {
                  backgroundColor: isDark
                    ? "rgba(0,0,0,0.6)"
                    : "rgba(255,255,255,0.8)",
                },
              ]}
            >
              <AppText weight="semibold" style={styles.avatarOverlayText}>
                更换
              </AppText>
            </View>
          </Pressable>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Label color={t.label}>名字</Label>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="请输入您的姓名"
            t={t}
            returnKeyType="next"
            onSubmitEditing={() => jobInputRef.current?.focus()}
          />
        </View>

        {/* Capability Section */}
        <View className="section" style={styles.section}>
          <Label color={t.label}>想提升的能力</Label>
          <View style={styles.chips}>
            {[
              { key: "decision", label: "决策能力" },
              { key: "expression", label: "表达能力" },
              { key: "custom", label: "自定义" },
            ].map((opt) => {
              const on = capability === (opt.key as Capability);
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setCapability(opt.key as Capability)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: on ? t.chipOnBg : t.chipBg,
                      borderColor: on ? t.chipOnBg : t.border,
                    },
                  ]}
                >
                  <AppText
                    weight={on ? "semibold" : "normal"}
                    style={{ color: on ? t.chipOnText : t.chipText }}
                  >
                    {opt.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {capability === "custom" && (
            <View style={styles.customCapContainer}>
              <Input
                value={customCap}
                onChangeText={setCustomCap}
                placeholder="例如：专注力、抗压能力、谈判技巧…"
                t={t}
                returnKeyType="next"
                onSubmitEditing={() => jobInputRef.current?.focus()}
              />
            </View>
          )}
        </View>

        {/* Career Section */}
        <View style={styles.section}>
          <Label color={t.label}>目前的工作</Label>
          <Input
            ref={jobInputRef}
            value={job}
            onChangeText={setJob}
            placeholder="例如：产品经理、学生、销售…"
            t={t}
            returnKeyType="next"
            onSubmitEditing={() => interestsInputRef.current?.focus()}
          />
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Label color={t.label}>感兴趣的领域</Label>
          <Input
            ref={interestsInputRef}
            value={interests}
            onChangeText={setInterests}
            placeholder="多个兴趣请用逗号分隔，例如：投资, 创业, 体育…"
            t={t}
            multiline
            style={styles.textArea}
            onFocus={() => handleInputFocus(interestsInputRef)}
            returnKeyType="next"
            onSubmitEditing={() => birthdayInputRef.current?.focus()}
          />
        </View>

        {/* Birthday Section */}
        <View style={styles.section}>
          <Label color={t.label}>生日</Label>
          <Pressable onPress={showDatePickerModal}>
            <View pointerEvents="none">
              <Input
                ref={birthdayInputRef}
                value={formatDateForDisplay(birthday)}
                onChangeText={setBirthday} // Still allow manual input as fallback
                placeholder="点击选择日期或手动输入 YYYY-MM-DD"
                t={t}
                onFocus={() => {
                  handleInputFocus(birthdayInputRef);
                  showDatePickerModal();
                }}
              />
            </View>
          </Pressable>
          <AppText style={[styles.dateHint, { color: t.subtitle }]}>
            点击上方输入框选择日期
          </AppText>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={birthday ? new Date(birthday) : new Date(1990, 0, 1)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            locale="zh-CN" // Chinese locale for better user experience
          />
        )}

        {/* Action Button */}
        <Pressable
          style={[styles.btn, { backgroundColor: t.btnBg }]}
          onPress={onSave}
        >
          <AppText weight="bold" style={{ color: t.btnText }}>
            {mode === "setup" ? "完成设置" : "保存更改"}
          </AppText>
        </Pressable>

        {/* Extra padding for keyboard space */}
        <View style={styles.keyboardSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Enhanced Input component with forwardRef
const Input = React.forwardRef<RNTextInput, any & { t: any }>((props, ref) => {
  const { t, style, ...rest } = props;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      ref={ref}
      {...rest}
      placeholderTextColor={t.placeholder}
      onFocus={() => {
        setIsFocused(true);
        props.onFocus?.();
      }}
      onBlur={() => setIsFocused(false)}
      style={[
        styles.input,
        {
          borderColor: isFocused ? t.borderFocus : t.border,
          backgroundColor: t.inputBg,
          color: t.inputText,
        },
        style,
      ]}
    />
  );
});

// Add display name to fix ESLint warning
Input.displayName = "Input";

function Label({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <AppText weight="semibold" style={[styles.label, { color }]}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: "100%",
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  h1: {
    fontSize: 24,
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  sub: {
    fontSize: 15,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    alignItems: "center",
  },
  avatarOverlayText: {
    fontSize: 11,
    color: "#2563EB",
  },
  label: {
    marginBottom: 8,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 20,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chips: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  customCapContainer: {
    marginTop: 12,
  },
  btn: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateHint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  keyboardSpacer: {
    height: 100, // Extra space for keyboard
  },
});
