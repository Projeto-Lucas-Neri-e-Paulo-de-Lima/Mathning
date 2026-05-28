import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { ChartEmptyPlaceholder } from "./ChartEmptyPlaceholder";
import { useTheme } from "../../context/ThemeContext";
import type { ColorTokens } from "../../theme/tokens";

type Props = {
  /** Valores 0–100, um por rótulo */
  points: number[];
  labels: string[];
  empty?: boolean;
  emptyMessage?: string;
};

const SVG_WIDTH = 300;
const SVG_HEIGHT = 168;
const PAD_LEFT = 36;
const PAD_TOP = 8;
const PAD_BOTTOM = 36;
const PAD_RIGHT = 12;

/** Evita que 0% encoste na base e sobreponha os rótulos do eixo X. */
const Y_FLOOR_RATIO = 0.06;

export function SuccessRateLineChart({
  points,
  labels,
  empty = false,
  emptyMessage = "Pratique exercícios para ver sua evolução de acertos.",
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createSuccessRateLineChartStyles(colors), [colors]);

  if (empty || (points.every((p) => p === 0) && points.length > 0)) {
    return <ChartEmptyPlaceholder message={emptyMessage} />;
  }

  const chartW = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const chartH = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const max = 100;
  const n = points.length;
  const step = n > 1 ? chartW / (n - 1) : chartW;

  const yTicks = [0, 25, 50, 75, 100];

  const valueToY = (v: number) => {
    const ratio = v / max;
    const usable = 1 - Y_FLOOR_RATIO;
    return PAD_TOP + chartH * (1 - ratio * usable);
  };

  const coords = points.map((v, i) => {
    const x = PAD_LEFT + i * step;
    return { x, y: valueToY(v), v };
  });

  const poly = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const baselineY = valueToY(0);

  const rateSummary =
    points.length > 0 ? `Taxa atual ${points[points.length - 1]} por cento` : "";

  return (
    <View
      style={styles.wrap}
      accessibilityLabel={`Gráfico de evolução da taxa de acerto. ${rateSummary}`}
      accessibilityRole="image"
    >
      <Svg width={SVG_WIDTH} height={SVG_HEIGHT} accessible={false}>
        {yTicks.map((t) => {
          const y = valueToY(t);
          return (
            <Line
              key={t}
              x1={PAD_LEFT}
              y1={y}
              x2={SVG_WIDTH - PAD_RIGHT}
              y2={y}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 6"
            />
          );
        })}
        {yTicks.map((t) => {
          const y = valueToY(t) + 4;
          return (
            <SvgText key={`y-${t}`} x={4} y={y} fontSize={10} fill={colors.muted}>
              {t}
            </SvgText>
          );
        })}
        <Line
          x1={PAD_LEFT}
          y1={baselineY}
          x2={SVG_WIDTH - PAD_RIGHT}
          y2={baselineY}
          stroke={colors.border}
          strokeWidth={1}
        />
        <Polyline
          points={poly}
          fill="none"
          stroke={colors.success}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={5} fill={colors.success} />
        ))}
        {labels.map((label, i) => {
          const x = PAD_LEFT + i * step;
          return (
            <SvgText
              key={label}
              x={x}
              y={SVG_HEIGHT - 10}
              fontSize={11}
              fill={colors.muted}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
      <Text style={styles.caption}>Taxa de acerto mensal (%)</Text>
    </View>
  );
}

function createSuccessRateLineChartStyles(colors: ColorTokens) {
  return StyleSheet.create({
    wrap: { alignItems: "center" },
    caption: {
      marginTop: 8,
      fontSize: 12,
      color: colors.muted,
      textAlign: "center",
    },
  });
}
