import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import type { Operation } from "@mathning/shared";
import { getThemeColors } from "../theme/palettes";
import type { ColorTokens } from "../theme/tokens";

export type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type LessonTopicVisual = {
  icon: IoniconName;
  color: string;
  /** Rótulo curto para chips (ex.: operações básicas). */
  tag?: string;
};

const OPERATION_VISUALS: Record<Operation, LessonTopicVisual> = {
  add: { icon: "add-circle", color: "#10B981", tag: "Adição" },
  subtract: { icon: "remove-circle", color: "#A855F7", tag: "Subtração" },
  multiply: { icon: "close-circle", color: "#F59E0B", tag: "Multiplicação" },
  divide: { icon: "git-compare", color: "#2563EB", tag: "Divisão" },
};

/** Ícone e cor por assunto (conceitual ou operação). */
const TOPIC_VISUALS: Record<string, LessonTopicVisual> = {
  "number-system": { icon: "git-network-outline", color: "#5C49F5" },
  "reading-writing": { icon: "reader-outline", color: "#2563EB" },
  "place-value": { icon: "grid-outline", color: "#0D9488" },
  comparison: { icon: "swap-vertical-outline", color: "#7C3AED" },
  "fraction-intro": { icon: "pie-chart-outline", color: "#EA580C" },
  "fraction-simplify": { icon: "contract-outline", color: "#C2410C" },
  "fraction-decimal": { icon: "repeat-outline", color: "#D97706" },
  "fraction-ops": { icon: "calculator-outline", color: "#B45309" },
  "percent-intro": { icon: "stats-chart-outline", color: "#CA8A04" },
  "length-units": { icon: "resize-outline", color: "#0284C7" },
  "mass-units": { icon: "scale-outline", color: "#0369A1" },
  "time-units": { icon: "time-outline", color: "#4F46E5" },
  "unit-conversion": { icon: "swap-horizontal-outline", color: "#0891B2" },
  shapes: { icon: "shapes-outline", color: "#9333EA" },
  "area-perimeter": { icon: "square-outline", color: "#7E22CE" },
  "circle-intro": { icon: "ellipse-outline", color: "#6D28D9" },
  variables: { icon: "code-working-outline", color: "#DB2777" },
  expressions: { icon: "list-outline", color: "#BE185D" },
  "equations-basic": { icon: "git-branch-outline", color: "#E11D48" },
  "word-problems": { icon: "chatbubble-ellipses-outline", color: "#059669" },
  "rule-of-three": { icon: "trending-up-outline", color: "#0F766E" },
  "logic-reasoning": { icon: "bulb-outline", color: "#F59E0B" },
  "graphs-intro": { icon: "bar-chart-outline", color: "#2563EB" },
  add: OPERATION_VISUALS.add,
  subtract: OPERATION_VISUALS.subtract,
  multiply: OPERATION_VISUALS.multiply,
  divide: OPERATION_VISUALS.divide,
};

export function getLessonTopicVisual(
  lessonId: string,
  operation: Operation,
): LessonTopicVisual {
  return TOPIC_VISUALS[lessonId] ?? OPERATION_VISUALS[operation];
}

export type LessonIconState = {
  icon: IoniconName;
  iconColor: string;
  backgroundColor: string;
};

/**
 * Padrão da Trilha: checkmark (concluído), cadeado (bloqueado),
 * ícone do tópico (aberto).
 */
export function getLessonIconState(
  lessonId: string,
  operation: Operation,
  opts: { isDone: boolean; open: boolean },
  themeColors: ColorTokens = getThemeColors("light"),
): LessonIconState {
  const { isDone, open } = opts;

  if (isDone) {
    return {
      icon: "checkmark",
      iconColor: "#FFFFFF",
      backgroundColor: themeColors.success,
    };
  }

  if (!open) {
    return {
      icon: "lock-closed",
      iconColor: themeColors.locked,
      backgroundColor: themeColors.border,
    };
  }

  const topic = getLessonTopicVisual(lessonId, operation);
  return {
    icon: topic.icon,
    iconColor: topic.color,
    backgroundColor: `${topic.color}1F`,
  };
}
