// app/channels/communication/chat.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import ChatBubble from "../../../../components/ui/ChatBubble";
import InputDock from "../../../../components/ui/InputDock";

/** Types */
type Role = "ai" | "user";
type Msg = {
  id: string;
  role: Role;
  text: string;
  hint?: string; // AI: answer hint
  tip?: string; // USER: improvement suggestion
  showHint?: boolean;
  showTip?: boolean;
};

/** Helpers */
const uuid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const useDailyQuota = () => {
  const [hintUsed, setHintUsed] = useState(false);
  const [tipUsed, setTipUsed] = useState(false);
  return {
    hintLeft: hintUsed ? 0 : 1,
    tipLeft: tipUsed ? 0 : 1,
    markHintUsed: () => setHintUsed(true),
    markTipUsed: () => setTipUsed(true),
  };
};

function firstTurn(topic: string): { text: string; hint: string } {
  const m: Record<string, { q: string; h: string }> = {
    天气: {
      q: "我们聊聊天气。最近你那里气温如何？有没有影响到你的心情或安排？",
      h: "先描述天气，再补一句对你今天的影响，比如心情/通勤/运动。",
    },
    美食: {
      q: "来聊聊美食。你最近吃到的一道让你惊喜的菜是什么？",
      h: "说出菜名 + 味道/口感的1-2个细节，再补一句你会不会推荐给朋友。",
    },
    交友: {
      q: "谈谈交友。你会如何开启和陌生人的第一句对话？",
      h: "用礼貌问候 + 观察到的共同点/场景评论，保持开放式问题。",
    },
    体育: {
      q: "聊体育。你最近关注的比赛或运动是什么？为什么？",
      h: "说出项目/球队 + 一个你喜欢的亮点（战术/球员/氛围）。",
    },
    音乐: {
      q: "聊音乐。你循环最多的一首歌是什么？它带给你什么感觉？",
      h: "歌名 + 场景联想（工作/通勤/放松），用1个形容词概括感受。",
    },
    育儿: {
      q: "聊育儿。最近让你感到成就或困惑的一件小事是什么？",
      h: "描述情境 + 你的想法/做法 + 想向对方请教的问题。",
    },
    宠物: {
      q: "聊宠物。你的宠物最近有没有可爱的行为？",
      h: "说出一个具体瞬间 + 它让你发笑或感动的点。",
    },
    旅游: {
      q: "聊旅游。下一个你想去的城市是哪里？为什么？",
      h: "目的地 + 1-2个吸引你的理由（美食/建筑/自然/文化）。",
    },
    经济: {
      q: "聊经济。最近哪条经济新闻最吸引你？你的看法是？",
      h: "用一句话概括新闻 + 你的观点 + 一个你关心的影响面。",
    },
  };
  const hit = m[topic];
  if (hit) return { text: hit.q, hint: hit.h };
  return {
    text: `我们就从“${topic}”开始。你先分享一个真实的小经历吧。`,
    hint: "开头一句背景（何时何地）+ 一个感受/看法 + 一个问题邀请对方回应。",
  };
}

function nextAI(
  topic: string,
  userText: string
): { text: string; hint: string } {
  const polite = "谢谢你的分享。";
  const steer =
    "能再补充一点细节吗？比如一个具体的例子、你的感受，或者你会给朋友什么建议。";
  return {
    text: `${polite}${userText.length > 8 ? " 很具体！" : ""} ${steer}`,
    hint:
      topic === "交友"
        ? "用“我”开头，表达感受 + 提一个开放式问题邀请对方说更多。"
        : "先给1个细节，再加1句你的观点，最后抛一个问题让对话继续。",
  };
}

function improveSuggestion(topic: string, userText: string): string {
  return [
    "试试“三步法”：结论先行 → 1个具体细节 → 向对方抛一个问题。",
    `例如：${userText ? "“" + userText.slice(0, 12) + "…” 可以改为：" : ""}`,
    topic === "美食"
      ? "“这道菜最打动我的是酱香和回甜，我会推荐给第一次来这家店的朋友。你更喜欢辣口还是清淡？”"
      : "“我最在意的是____这点，比如____。你怎么看？有什么经验分享吗？”",
  ].join("\n");
}

export default function ChatPage() {
  const insets = useSafeAreaInsets();
  const { topic = "沟通" } = useLocalSearchParams<{ topic?: string }>();
  const [voiceOn, setVoiceOn] = useState(true);
  const { hintLeft, tipLeft, markHintUsed, markTipUsed } = useDailyQuota();

  const [messages, setMessages] = useState<Msg[]>(() => {
    const first = firstTurn(String(topic));
    return [
      { id: uuid(), role: "ai", text: first.text, hint: `提示：${first.hint}` },
    ];
  });

  const scrollRef = useRef<ScrollView>(null);

  // Auto TTS when new AI message arrives
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "ai" && voiceOn) {
      void Speech.stop();
      Speech.speak(last.text, { language: "zh-CN", rate: 0.98 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, voiceOn]);

  // Cleanup: stop TTS when leaving the page
  useEffect(() => {
    return () => {
      // Must be synchronous; swallow possible Promise to satisfy EffectCallback
      void Speech.stop();
    };
  }, []);

  const speak = (text: string) => {
    void Speech.stop();
    Speech.speak(text, { language: "zh-CN", rate: 0.98 });
  };

  const appendMsg = (msg: Msg) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      requestAnimationFrame(() =>
        scrollRef.current?.scrollToEnd({ animated: true })
      );
      return next;
    });
  };

  const onSend = (payload: { text?: string; audioUri?: string | null }) => {
    const text = (payload.text || "").trim();
    if (!text) return;

    appendMsg({
      id: uuid(),
      role: "user",
      text,
      tip: improveSuggestion(String(topic), text),
    });

    setTimeout(() => {
      const nxt = nextAI(String(topic), text);
      appendMsg({
        id: uuid(),
        role: "ai",
        text: nxt.text,
        hint: `提示：${nxt.hint}`,
      });
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.replace("/channels/communication")}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <Text style={styles.title}>{String(topic)}</Text>

        <Pressable
          style={[
            styles.iconBtn,
            { backgroundColor: voiceOn ? "#EEF2FF" : "#F3F4F6" },
          ]}
          onPress={() => {
            if (voiceOn) void Speech.stop();
            setVoiceOn((v) => !v);
          }}
        >
          <Ionicons
            name={voiceOn ? "volume-high-outline" : "volume-mute-outline"}
            size={18}
            color={voiceOn ? "#4F46E5" : "#6B7280"}
          />
        </Pressable>
      </View>

      {/* Chat */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 0 })}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 96,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m) => {
            const isAI = m.role === "ai";
            return (
              <View key={m.id} style={{ marginBottom: 12 }}>
                <ChatBubble
                  variant={isAI ? "incoming" : "outgoing"}
                  text={m.text}
                  rightAccessory={
                    <Pressable
                      onPress={() => speak(m.text)}
                      hitSlop={10}
                      style={styles.speakerBtn}
                    >
                      <Ionicons
                        name="volume-high-outline"
                        size={18}
                        color="#4F46E5"
                      />
                    </Pressable>
                  }
                />

                {/* AI: hint (daily once) */}
                {isAI && m.hint ? (
                  <View style={styles.rowInline}>
                    {!m.showHint ? (
                      <Pressable
                        onPress={() => {
                          if (hintLeft <= 0)
                            return alert("今日免费提示次数已用完。");
                          markHintUsed();
                          setMessages((prev) =>
                            prev.map((x) =>
                              x.id === m.id ? { ...x, showHint: true } : x
                            )
                          );
                        }}
                        style={styles.pill}
                      >
                        <Ionicons
                          name="bulb-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.pillText}>点击查看提示</Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.hintText}>{m.hint}</Text>
                    )}
                  </View>
                ) : null}

                {/* USER: improvement tip (daily once) */}
                {!isAI && m.tip ? (
                  <View style={styles.rowInlineRight}>
                    {!m.showTip ? (
                      <Pressable
                        onPress={() => {
                          if (tipLeft <= 0)
                            return alert("今日免费提升建议次数已用完。");
                          markTipUsed();
                          setMessages((prev) =>
                            prev.map((x) =>
                              x.id === m.id ? { ...x, showTip: true } : x
                            )
                          );
                        }}
                        style={[styles.pill, { backgroundColor: "#ECFEFF" }]}
                      >
                        <Ionicons
                          name="sparkles-outline"
                          size={14}
                          color="#0891B2"
                        />
                        <Text style={[styles.pillText, { color: "#0369A1" }]}>
                          提升建议
                        </Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.tipText}>{m.tip}</Text>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        {/* InputDock */}
        <InputDock
          onSend={(payload: { text?: string }) =>
            onSend({ text: payload?.text })
          }
          onMicPress={() => alert("麦克风录音占位：稍后可接入语音转文字。")}
          onMicStop={async () => null}
          isRecording={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  title: { fontSize: 16, fontWeight: "800", color: "#111827" },

  speakerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },

  rowInline: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowInlineRight: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  pillText: { fontSize: 12, color: "#6B7280", fontWeight: "700" },

  hintText: { fontSize: 12, color: "#4B5563", lineHeight: 18, paddingLeft: 4 },
  tipText: { fontSize: 12, color: "#0369A1", lineHeight: 18, paddingLeft: 4 },
});
