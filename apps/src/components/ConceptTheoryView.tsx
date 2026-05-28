import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import type { ConceptTheory, LearningModule, Lesson } from "@mathning/shared";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppCard } from "./AppCard";
import { ScreenBackground } from "./ScreenBackground";
import type { LessonTopicVisual } from "../constants/lessonIcons";
import { useTheme } from "../context/ThemeContext";
import type { RootStackParamList } from "../navigation/types";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Tab = "concept" | "examples";

export function ConceptTheoryView({
  lesson,
  conceptTheory,
  moduleMeta,
  navigation,
  moduleId,
  lessonId,
  topicVisual,
  alreadyDone,
  onComplete,
}: {
  lesson: Lesson;
  conceptTheory: ConceptTheory;
  moduleMeta: LearningModule | undefined;
  navigation: Nav;
  moduleId: string;
  lessonId: string;
  topicVisual: LessonTopicVisual;
  alreadyDone: boolean;
  onComplete: () => void;
}) {
  const { colors, layout } = useTheme();
  const styles = useMemo(
    () => createConceptTheoryStyles(colors),
    [colors],
  );
  const theory = conceptTheory;
  const [tab, setTab] = useState<Tab>("concept");

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={layout.scroll}>
        <AppCard variant="accent" style={styles.hero}>
          <View style={styles.heroTop}>
            <View
              style={[
                styles.heroIconWrap,
                { backgroundColor: `${topicVisual.color}1F` },
              ]}
            >
              <Ionicons name={topicVisual.icon} size={22} color={topicVisual.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>Teoria · {moduleMeta?.title ?? "Módulo"}</Text>
              <Text style={styles.heroTitle}>{lesson.title}</Text>
              <Text style={styles.heroSub}>{lesson.summary}</Text>
            </View>
          </View>
          {theory.introTip ? (
            <View style={styles.introTip}>
              <Ionicons name="bulb-outline" size={16} color={colors.streak} />
              <Text style={styles.introTipTxt}>{theory.introTip}</Text>
            </View>
          ) : null}
        </AppCard>

        <View style={styles.tabWrap}>
          <Pressable
            style={[styles.tabBtn, tab === "concept" && styles.tabBtnActive]}
            onPress={() => setTab("concept")}
          >
            <Text style={[styles.tabTxt, tab === "concept" && styles.tabTxtActive]}>Conceito</Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, tab === "examples" && styles.tabBtnActive]}
            onPress={() => setTab("examples")}
          >
            <Text style={[styles.tabTxt, tab === "examples" && styles.tabTxtActive]}>Exemplos</Text>
          </Pressable>
        </View>

        {tab === "concept" ? (
          <>
            {theory.conceptBlocks.map((block) => (
              <AppCard key={block.title}>
                <Text style={styles.sectionTitle}>{block.title}</Text>
                <Text style={styles.body}>{block.body}</Text>
              </AppCard>
            ))}

            <AppCard>
              <Text style={styles.sectionTitle}>Vocabulário</Text>
              {theory.vocabulary.map((v) => (
                <Text key={v.term} style={styles.vocabLine}>
                  <Text style={styles.vocabStrong}>{v.term}:</Text> {v.definition}
                </Text>
              ))}
            </AppCard>

            <AppCard>
              <Text style={styles.sectionTitle}>Regrinhas importantes</Text>
              {theory.ruleNotes.map((rule) => (
                <View key={rule.title} style={styles.ruleItem}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  <Text style={styles.ruleText}>{rule.text}</Text>
                </View>
              ))}
            </AppCard>
          </>
        ) : (
          <>
            {theory.examples.map((ex, i) => (
              <AppCard key={ex.id}>
                <View style={styles.exampleTitleRow}>
                  <View style={[styles.badge, { backgroundColor: topicVisual.color }]}>
                    <Text style={styles.badgeTxt}>{i + 1}</Text>
                  </View>
                  <Text style={styles.exampleTitle}>{ex.title}</Text>
                </View>
                {ex.expression ? (
                  <View style={styles.expressionBox}>
                    <Text style={styles.expressionTxt}>{ex.expression}</Text>
                  </View>
                ) : null}
                {ex.visualLines && ex.visualLines.length > 0 ? (
                  <>
                    <Text style={styles.visualLabel}>Visualização:</Text>
                    <View style={styles.monoBox}>
                      {ex.visualLines.map((line, li) => (
                        <Text key={li} style={styles.monoLine}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  </>
                ) : null}
                {ex.armedLines && ex.armedLines.length > 0 ? (
                  <>
                    <Text style={styles.visualLabel}>Conta armada:</Text>
                    <View style={styles.monoBox}>
                      {ex.armedLines.map((line, li) => (
                        <Text key={li} style={styles.monoLine}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  </>
                ) : null}
                <View style={styles.answerBox}>
                  <Text style={styles.answerTxt}>{ex.explanation}</Text>
                </View>
                {ex.note ? <Text style={styles.note}>{ex.note}</Text> : null}
              </AppCard>
            ))}
          </>
        )}

        <AppCard variant="accent" style={styles.practiceCard}>
          <Text style={styles.practiceTitle}>Pronto para praticar?</Text>
          <Text style={styles.practiceSub}>
            Reforce com exercícios interativos deste assunto.
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("Exercise", { moduleId, lessonId })}
          >
            <Text style={styles.primaryBtnTxt}>Ir para Exercícios</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>
        </AppCard>

        <AppCard>
          <Text style={styles.small}>
            {moduleMeta
              ? `Módulo: ${moduleMeta.title}. Marque como concluído quando terminar a leitura.`
              : "Marque como concluído quando terminar a leitura."}
          </Text>
          {alreadyDone ? (
            <View style={styles.doneRow}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={styles.ok}>Assunto concluído na trilha</Text>
            </View>
          ) : (
            <Pressable style={styles.secondaryBtn} onPress={onComplete}>
              <Text style={styles.secondaryBtnTxt}>Marcar como concluído</Text>
            </Pressable>
          )}
        </AppCard>
      </ScrollView>
    </ScreenBackground>
  );
}

function createConceptTheoryStyles(colors: ColorTokens) {
  return StyleSheet.create({
  hero: {},
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 6 },
  heroSub: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  introTip: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.streakBg,
    padding: 10,
    borderRadius: radius.sm,
  },
  introTipTxt: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 18 },
  tabWrap: {
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    padding: 4,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: radius.pill },
  tabBtnActive: { backgroundColor: colors.card },
  tabTxt: { fontSize: 13, fontWeight: "600", color: colors.muted },
  tabTxtActive: { color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 },
  body: { fontSize: 15, color: colors.bodyText, lineHeight: 23 },
  vocabLine: { fontSize: 14, color: colors.text, marginBottom: 8, lineHeight: 21 },
  vocabStrong: { fontWeight: "700" },
  ruleItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ruleTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 4 },
  ruleText: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  exampleTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  exampleTitle: { fontSize: 18, fontWeight: "700", color: colors.text, flex: 1 },
  expressionBox: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.cardMuted,
    paddingVertical: 12,
    alignItems: "center",
  },
  expressionTxt: { fontSize: 22, fontWeight: "800", color: colors.text },
  visualLabel: { fontSize: 12, color: colors.muted, marginBottom: 6 },
  monoBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.bgSoft,
    marginBottom: 10,
  },
  monoLine: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  answerBox: {
    backgroundColor: colors.successBg,
    borderColor: "#C7F3D5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  answerTxt: { fontSize: 13, color: colors.successDark, lineHeight: 19 },
  note: { marginTop: 8, fontSize: 12, color: colors.muted, lineHeight: 17 },
  practiceCard: {},
  practiceTitle: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 6 },
  practiceSub: { fontSize: 13, color: colors.muted, marginBottom: 12 },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  primaryBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  secondaryBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: radius.btn,
    alignItems: "center",
  },
  secondaryBtnTxt: { color: colors.text, fontWeight: "700" },
  doneRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  ok: { fontWeight: "700", color: colors.successDark },
  });
}
