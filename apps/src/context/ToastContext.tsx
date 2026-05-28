import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useTheme } from "./ThemeContext";
import { radius } from "../theme/radius";
import { fontFamilies } from "../theme/typography";
import type { ColorTokens } from "../theme/tokens";

export type ToastVariant = "success" | "error" | "info";

export type ShowToastOptions = {
  message: string;
  variant?: ToastVariant;
  /** ms; padrão 2800 */
  duration?: number;
};

type ToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastPayload = {
  message: string;
  variant: ToastVariant;
  id: number;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    ({ message, variant = "info", duration = 2800 }: ShowToastOptions) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, variant, id: Date.now() });
      timerRef.current = setTimeout(hideToast, duration);
    },
    [hideToast],
  );

  const value = useMemo(
    () => ({ showToast, hideToast }),
    [showToast, hideToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastOverlay toast={toast} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return ctx;
}

function ToastOverlay({
  toast,
  onHide,
}: {
  toast: ToastPayload | null;
  onHide: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const visibleId = useRef<number | null>(null);

  useEffect(() => {
    if (!toast) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -24,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
      return;
    }

    if (visibleId.current === toast.id) return;
    visibleId.current = toast.id;

    translateY.setValue(-24);
    opacity.setValue(0);
    if (reduceMotion) {
      translateY.setValue(0);
      opacity.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [toast, translateY, opacity, reduceMotion]);

  if (!toast) return null;

  const { styles, iconColor } = createToastStyles(colors, toast.variant);
  const icon =
    toast.variant === "success"
      ? "checkmark-circle"
      : toast.variant === "error"
        ? "alert-circle"
        : "information-circle";

  return (
    <View
      style={[styles.host, { paddingTop: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.banner,
          { transform: [{ translateY }], opacity },
        ]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text style={styles.message} numberOfLines={3}>
          {toast.message}
        </Text>
        <Pressable
          onPress={onHide}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
        >
          <Ionicons name="close" size={20} color={iconColor} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function createToastStyles(colors: ColorTokens, variant: ToastVariant) {
  const palette =
    variant === "success"
      ? {
          bg: colors.successBg,
          border: colors.success,
          text: colors.successDark,
        }
      : variant === "error"
        ? {
            bg: colors.errorBg,
            border: colors.error,
            text: colors.errorDark,
          }
        : {
            bg: colors.infoBg,
            border: colors.infoBorder,
            text: colors.infoText,
          };

  const iconColor = palette.text;

  const styles = StyleSheet.create({
    host: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      width: "100%",
      maxWidth: 420,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: radius.card,
      backgroundColor: palette.bg,
      borderWidth: 1,
      borderColor: palette.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
    },
    message: {
      flex: 1,
      fontFamily: fontFamilies.semiBold,
      fontSize: 14,
      lineHeight: 20,
      color: palette.text,
    },
  });

  return { styles, iconColor };
}
