// hooks/useRecorder.ts
// Expo SDK 53+/54：使用 expo-audio（expo-av 已弃用）
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function useRecorder() {
  const [level, setLevel] = useState(0); // 0..1
  const [uri, setUri] = useState<string | null>(null);

  // 关键：固定回调引用，避免 recorder 被重建
  const onStatus = useCallback((status: any) => {
    const db = typeof status?.metering === "number" ? status.metering : -120;
    const norm = clamp01((db + 60) / 60);
    setLevel(norm);
  }, []);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, onStatus);
  const recState = useAudioRecorderState(recorder, 250);

  // 软锁，防双击与竞态
  const stoppingRef = useRef(false);
  const preparedRef = useRef(false);

  // 不在卸载时强制 stop，避免对已释放对象再次 stop
  useEffect(() => {
    return () => {
      // no-op
    };
  }, []);

  const ensureMicPermission = async () => {
    const cur = await AudioModule.getRecordingPermissionsAsync();
    if (cur.granted) return true;
    const req = await AudioModule.requestRecordingPermissionsAsync();
    return !!req.granted;
  };

  const start = async () => {
    // 已在录音或正在停止中，直接忽略
    if (recState.isRecording || stoppingRef.current) return;

    const ok = await ensureMicPermission();
    if (!ok) throw new Error("permission-denied");

    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });

    await recorder.prepareToRecordAsync({
      ...RecordingPresets.HIGH_QUALITY,
      numberOfChannels: 1,
      isMeteringEnabled: true,
    } as any);

    preparedRef.current = true;
    recorder.record();
  };

  const stopAndUnload = async () => {
    // 防止重复 stop 或对象尚未准备
    if (stoppingRef.current) return uri;
    if (!recState.isRecording || !preparedRef.current) return uri;

    stoppingRef.current = true;
    try {
      await recorder.stop();
      const u = (recorder as any).uri ?? null;
      setUri(u);
      setLevel(0);
      return u;
    } catch {
      // 典型：对象已释放或原生抛错，忽略即可
      return uri;
    } finally {
      stoppingRef.current = false;
      preparedRef.current = false;
    }
  };

  return {
    start,
    stopAndUnload,
    isRecording: !!recState.isRecording,
    level,
    uri,
  };
}
