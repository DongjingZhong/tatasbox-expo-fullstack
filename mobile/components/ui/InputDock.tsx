import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export type InputDockTheme = {
  primary: string;
  micActive?: string;
  bg?: string;
  border?: string;
  inputBg?: string;
  hint?: string;
  hudBg?: string;
  hudText?: string;
  cancelBg?: string;
  cancelText?: string;
};

type Props = {
  onSend: (payload: {
    text?: string;
    imageUri?: string;
    audioUri?: string;
  }) => void;
  onMicPress: () => void;
  onMicStop: () => Promise<string | null>;
  isRecording: boolean;
  theme?: InputDockTheme;
  placeholder?: string;
  holdToTalkLabel?: string;
};

const DEFAULT_THEME: Required<InputDockTheme> = {
  primary: "#111827",
  micActive: "#EF4444",
  bg: "#FFFFFF",
  border: "#EEEEEE",
  inputBg: "#F7F7F8",
  hint: "#9CA3AF",
  hudBg: "#F3F4F6",
  hudText: "#374151",
  cancelBg: "#E5E7EB",
  cancelText: "#6B7280",
};

const InputDock: React.FC<Props> = ({
  onSend,
  onMicPress,
  onMicStop,
  isRecording,
  theme,
  placeholder = "输入回答…",
  holdToTalkLabel = "按住麦克风说话，松开发送",
}) => {
  // 先 memo 合并主题，再以主题为唯一依赖创建样式，避免 linter 警告
  const T = useMemo(() => ({ ...DEFAULT_THEME, ...(theme ?? {}) }), [theme]);
  const styles = useMemo(() => makeStyles(T), [T]);

  const [text, setText] = useState("");
  const [cancelRecording, setCancelRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    let t: number | null = null;
    if (isRecording) {
      setSeconds(0);
      t = setInterval(
        () => setSeconds((s) => s + 1),
        1000
      ) as unknown as number;
    } else {
      setSeconds(0);
    }
    return () => {
      if (t !== null) clearInterval(t as any);
    };
  }, [isRecording]);

  const handleHoldMicStart = () => {
    setCancelRecording(false);
    setStopped(false);
    onMicPress();
  };

  const handleHoldMicEnd = async () => {
    if (stopped) return;
    setStopped(true);
    const uri = await onMicStop();
    if (!cancelRecording && uri) onSend({ audioUri: uri });
    setCancelRecording(false);
  };

  const handleCancelTap = async () => {
    if (stopped) return;
    setCancelRecording(true);
    setStopped(true);
    await onMicStop();
  };

  const handleSendText = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend({ text: trimmed });
    setText("");
  };

  const showSend = text.trim().length > 0;

  return (
    <View style={styles.wrap}>
      {isRecording && (
        <View style={styles.recordHud}>
          <View style={styles.dot} />
          <Text style={styles.recordText}>
            Recording {formatTime(seconds)} · Release to send
          </Text>
          <Pressable onPress={handleCancelTap} style={styles.cancelBtn}>
            <Ionicons name="close" size={18} color={T.cancelText} />
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={isRecording ? "Recording..." : placeholder}
          placeholderTextColor={T.hint}
          style={styles.input}
          multiline
          editable={!isRecording}
        />

        {showSend ? (
          <Pressable
            style={styles.actionCircle}
            onPress={handleSendText}
            accessibilityLabel="发送"
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.actionCircle, isRecording && styles.micActiveCircle]}
            onPressIn={handleHoldMicStart}
            onPressOut={handleHoldMicEnd}
            accessibilityLabel="按住说话，松开发送"
          >
            <Ionicons name="mic" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      {!showSend && !isRecording && (
        <Text style={styles.hint}>{holdToTalkLabel}</Text>
      )}
    </View>
  );
};

export default InputDock;

/** ---------- helpers ---------- */
function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** ---------- styles (theme-aware) ---------- */
function makeStyles(T: Required<InputDockTheme>) {
  return StyleSheet.create({
    wrap: {
      gap: 8,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: T.border,
      backgroundColor: T.bg,
    },
    row: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: T.inputBg,
      fontSize: 16,
      color: "#0F172A",
    },
    actionCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.primary,
    },
    micActiveCircle: { backgroundColor: T.micActive },
    hint: { fontSize: 12, color: T.hint, textAlign: "center" },
    recordHud: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      alignSelf: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: T.hudBg,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.micActive },
    recordText: { fontSize: 14, color: T.hudText },
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginLeft: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: T.cancelBg,
    },
    cancelText: { fontSize: 12, color: T.cancelText },
  });
}
