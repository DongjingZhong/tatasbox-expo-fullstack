// components/ui/ChatBubble.tsx
import React from "react";
import {
  Platform,
  StyleSheet,
  useColorScheme,
  View,
  type DimensionValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import AppText from "./AppText";

type Props = {
  text?: string;
  children?: React.ReactNode;
  /** Left (incoming) or right (outgoing) bubble */
  variant?: "incoming" | "outgoing";
  /** Whether to show the small tail (off by default for a cleaner look) */
  showTail?: boolean;
  /** Max width of the bubble (px or percentage e.g. "86%") */
  maxWidth?: DimensionValue;
  /** A trailing accessory, e.g., a speaker button */
  rightAccessory?: React.ReactNode;
  /** Container style overrides */
  style?: StyleProp<ViewStyle>;
  /** Bubble surface style overrides */
  contentStyle?: StyleProp<ViewStyle>;
  /** Text style overrides */
  textStyle?: StyleProp<TextStyle>;
};

const ChatBubble: React.FC<Props> = ({
  text,
  children,
  variant = "incoming",
  showTail = false, // default off to keep it natural/pro
  maxWidth = "86%" as const,
  rightAccessory,
  style,
  contentStyle,
  textStyle,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Neutral, professional colors
  const incomingBg = isDark ? "#1F2937" : "#FFFFFF";
  const incomingBorder = isDark ? "#2A3037" : "#E5E7EB";
  const incomingText = isDark ? "#F9FAFB" : "#111827";

  const outgoingBg = isDark ? "#0B3B2E" : "#EAF7EE";
  const outgoingBorder = isDark ? "#0E4A3A" : "#CFEBD7";
  const outgoingText = isDark ? "#ECFDF5" : "#065F46";

  const isIncoming = variant === "incoming";
  const bg = isIncoming ? incomingBg : outgoingBg;
  const border = isIncoming ? incomingBorder : outgoingBorder;
  const fg = isIncoming ? incomingText : outgoingText;

  // Corner radii: top-left (incoming) or top-right (outgoing) is square (0)
  const R = 18;
  const cornerStyle: ViewStyle = isIncoming
    ? {
        borderTopLeftRadius: 0, // square
        borderTopRightRadius: R,
        borderBottomRightRadius: R,
        borderBottomLeftRadius: R,
      }
    : {
        borderTopLeftRadius: R,
        borderTopRightRadius: 0, // square (mirror)
        borderBottomRightRadius: R,
        borderBottomLeftRadius: R,
      };

  return (
    <View
      style={[
        styles.row,
        { justifyContent: isIncoming ? "flex-start" : "flex-end" },
        style,
      ]}
    >
      <View style={{ maxWidth, position: "relative" }}>
        {/* Bubble body */}
        <View
          style={[
            styles.bubble,
            cornerStyle,
            {
              backgroundColor: bg,
              borderColor: border,
              ...(Platform.OS === "ios"
                ? {
                    // Soft, professional shadow
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                  }
                : { elevation: 3 }),
            },
            contentStyle,
          ]}
        >
          {children ? (
            children
          ) : (
            <AppText size={15} lh={1.45} style={[{ color: fg }, textStyle]}>
              {text}
            </AppText>
          )}
        </View>

        {/* Optional tiny tail hugging the square corner */}
        {showTail && (
          <View
            pointerEvents="none"
            style={[
              styles.tailSquare,
              isIncoming ? styles.tailIncomingPos : styles.tailOutgoingPos,
              { backgroundColor: border },
            ]}
          >
            <View style={[styles.tailSquareInner, { backgroundColor: bg }]} />
          </View>
        )}
      </View>

      {rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8, // If unsupported, replace with margins
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },

  // Tail: a tiny rotated square (outer = border, inner = fill) placed at the square corner
  tailSquare: {
    position: "absolute",
    width: 14,
    height: 14,
    transform: [{ rotate: "45deg" }],
    borderRadius: 2,
  },
  tailSquareInner: {
    position: "absolute",
    top: 1.5,
    left: 1.5,
    right: 1.5,
    bottom: 1.5,
    borderRadius: 2,
  },
  tailIncomingPos: {
    top: -6, // hugs the top-left square corner
    left: -6,
  },
  tailOutgoingPos: {
    top: -6, // hugs the top-right square corner
    right: -6,
  },

  accessory: { marginLeft: 4 },
});

export default ChatBubble;
