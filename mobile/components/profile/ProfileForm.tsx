// All comments in English only.
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuthProfile } from "@/src/store/useAuthProfile";
import { Capability, isProfileComplete } from "@/src/types/profile";

type Mode = "setup" | "edit";
export default function ProfileForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { profile, setProfile } = useAuthProfile((s) => ({
    profile: s.profile,
    setProfile: s.setProfile,
  }));

  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar ?? "");
  const [capability, setCapability] = useState<Capability>(
    profile?.capability ?? "decision"
  );
  const [customCap, setCustomCap] = useState(profile?.customCapability ?? "");
  const [job, setJob] = useState(profile?.job ?? "");
  const [interests, setInterests] = useState(
    (profile?.interests ?? []).join(",")
  );
  const [birthday, setBirthday] = useState(profile?.birthday ?? "");

  const pickAvatar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled) setAvatar(res.assets[0].uri);
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

    // After save: onboarding goes forward, edit goes back.
    if (mode === "setup") router.replace("/channels");
    else router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>
        {mode === "setup" ? "完善个人资料" : "编辑个人资料"}
      </Text>
      <Text style={styles.sub}>这些信息仅用于为你定制体验，随时可修改。</Text>

      <View style={styles.row}>
        <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <Text style={{ color: "#6B7280" }}>
              使用或更换头像（默认取 Google）
            </Text>
          )}
        </Pressable>
      </View>

      <Label>名字</Label>
      <Input value={name} onChangeText={setName} placeholder="你的名字" />

      <Label>想提升的能力</Label>
      <View style={styles.chips}>
        {[
          { key: "decision", label: "决策" },
          { key: "expression", label: "表达" },
          { key: "custom", label: "自定义" },
        ].map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setCapability(opt.key as Capability)}
            style={[styles.chip, capability === opt.key && styles.chipOn]}
          >
            <Text
              style={[
                styles.chipText,
                capability === opt.key && styles.chipTextOn,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {capability === "custom" && (
        <>
          <Label>自定义能力</Label>
          <Input
            value={customCap}
            onChangeText={setCustomCap}
            placeholder="例如：专注、抗压、谈判…"
          />
        </>
      )}

      <Label>目前的工作</Label>
      <Input
        value={job}
        onChangeText={setJob}
        placeholder="例如：产品经理 / 学生 / 销售…"
      />

      <Label>感兴趣的领域（逗号分隔）</Label>
      <Input
        value={interests}
        onChangeText={setInterests}
        placeholder="投资, 创业, 体育…"
      />

      <Label>生日（YYYY-MM-DD）</Label>
      <Input
        value={birthday}
        onChangeText={setBirthday}
        placeholder="1992-05-20"
      />

      <Pressable style={styles.btn} onPress={onSave}>
        <Text style={styles.btnText}>
          {mode === "setup" ? "保存并继续" : "保存"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}
function Input(props: any) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor="#9CA3AF"
    />
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20 },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  sub: { color: "#6B7280", marginBottom: 16 },
  row: { marginBottom: 16, alignItems: "center" },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  chips: { flexDirection: "row", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  chipOn: { backgroundColor: "#111827" },
  chipText: { color: "#111827" },
  chipTextOn: { color: "white" },
  btn: {
    marginTop: 18,
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "700" },
});
