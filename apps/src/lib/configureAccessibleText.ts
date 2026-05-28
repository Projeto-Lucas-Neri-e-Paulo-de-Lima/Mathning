import { Text, TextInput } from "react-native";
import { MAX_FONT_SCALE } from "../theme/fontScale";

type TextDefaults = {
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
};

/** Limite de escala do tamanho de fonte do sistema (evita layout quebrado). */
export function configureAccessibleText(): void {
  const defaults: TextDefaults = {
    allowFontScaling: true,
    maxFontSizeMultiplier: MAX_FONT_SCALE,
  };

  const TextWithDefaults = Text as typeof Text & {
    defaultProps?: TextDefaults;
  };
  const TextInputWithDefaults = TextInput as typeof TextInput & {
    defaultProps?: TextDefaults;
  };

  TextWithDefaults.defaultProps = {
    ...TextWithDefaults.defaultProps,
    ...defaults,
  };
  TextInputWithDefaults.defaultProps = {
    ...TextInputWithDefaults.defaultProps,
    ...defaults,
  };
}
