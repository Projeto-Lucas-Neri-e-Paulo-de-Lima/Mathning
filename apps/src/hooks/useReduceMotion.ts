import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Respeita “Reduzir movimento” do sistema (iOS/Android). */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => setReduceMotion(enabled),
    );

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduceMotion;
}
