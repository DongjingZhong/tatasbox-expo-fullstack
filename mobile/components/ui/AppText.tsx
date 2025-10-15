// components/ui/AppText.tsx
import React from "react";
import {
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

type Variant = "title" | "headline" | "body" | "caption" | "label";

type Props = TextProps & {
  /** Typography preset (font size + line height) */
  variant?: Variant;
  /** Use muted color (e.g., secondary text) */
  muted?: boolean;
  /** Override font weight (e.g., "600", "700") */
  weight?: TextStyle["fontWeight"];
  /** Text alignment shortcut */
  align?: TextStyle["textAlign"];
  /** Style override */
  style?: StyleProp<TextStyle>;
};

const PRESETS: Record<Variant, { fontSize: number; lineHeight: number }> = {
  title: { fontSize: 22, lineHeight: 28 },
  headline: { fontSize: 18, lineHeight: 24 },
  body: { fontSize: 16, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 12, lineHeight: 16 },
};

const AppText: React.FC<Props> = ({
  variant = "body",
  muted = false,
  weight,
  align,
  style,
  children,
  // Keep font scaling ON for accessibility; can be overridden per-usage
  allowFontScaling = true,
  ...rest
}) => {
  const { colors } = useTheme();
  const preset = PRESETS[variant];

  return (
    <Text
      {...rest}
      allowFontScaling={allowFontScaling}
      style={[
        {
          color: muted ? colors.mutedText : colors.text, // auto-adapt to theme
          fontSize: preset.fontSize,
          lineHeight: preset.lineHeight,
          textAlign: align,
          fontWeight: weight,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default AppText;
