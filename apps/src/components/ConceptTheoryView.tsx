import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import type { ConceptTheory, LearningModule, Lesson } from "@mathning/shared";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "./AppButton";
import { LessonFlowBar } from "./LessonFlowBar";
import { AppCard } from "./AppCard";
import type { TheorySectionLink } from "../context/TheoryReaderContext";
import { TheoryReaderShell } from "./TheoryReaderShell";
import { TheorySection } from "./TheorySection";
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

  const sections = useMemo((): TheorySectionLink[] => {
    if (tab === "examples") {
      return theory.examples.map((ex, i) => ({
        id: `ex-${ex.id}`,
        title: ex.title || `Exemplo ${i + 1}`,
      }));
    }
    const links: TheorySectionLink[] = theory.conceptBlocks.map((block) => ({
      id: `block-${block.title}`,
      title: block.title,
    }));
    links.push({ id: "vocab", title: "Vocabulário" });
    links.push({ id: "rules", title: "Regras" });
    links.push({ id: "practice-cta", title: "Praticar" });
    return links;
  }, [tab, theory]);

  return (
    <TheoryReaderShell
      sections={sections}
      header={
        <LessonFlowBar
          navigation={navigation}
          moduleId={moduleId}
          lessonId={lessonId}
          lessonTitle={lesson.title}
          mode="theory"
        />
      }
    >
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
              <TheorySection key={block.title} sectionId={`block-${block.title}`}>
                <AppCard>
                  <Text style={styles.sectionTitle}>{block.title}</Text>
                  <Text style={styles.body}>{block.body}</Text>
                </AppCard>
              </TheorySection>
            ))}

            <TheorySection sectionId="vocab">
            <AppCard>
              <Text style={styles.sectionTitle}>Vocabulário</Text>
              {theory.vocabulary.map((v) => (
                <Text key={v.term} style={styles.vocabLine}>
                  <Text style={styles.vocabStrong}>{v.term}:</Text> {v.definition}
                </Text>
              ))}
            </AppCard>
            </TheorySection>

            <TheorySection sectionId="rules">
            <AppCard>
              <Text style={styles.sectionTitle}>Regrinhas importantes</Text>
              {theory.ruleNotes.map((rule) => (
                <View key={rule.title} style={styles.ruleItem}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  <Text style={styles.ruleText}>{rule.text}</Text>
                </View>
              ))}
            </AppCard>
            </TheorySection>
          </>
        ) : (
          <>
            {theory.examples.map((ex, i) => (
              <TheorySection key={ex.id} sectionId={`ex-${ex.id}`}>
              <AppCard>
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
              </TheorySection>
            ))}
          </>
        )}

        <TheorySection sectionId="practice-cta">
        <AppCard variant="accent" style={styles.practiceCard}>
          <Text style={styles.practiceTitle}>Pronto para praticar?</Text>
          <Text style={styles.practiceSub}>
            Reforce com exercícios interativos deste assunto.
          </Text>
          <AppButton
            label="Ir para Exercícios"
            icon="chevron-forward"
            onPress={() => navigation.navigate("Exercise", { moduleId, lessonId })}
            style={styles.ctaBtn}
          />
        </AppCard>
        </TheorySection>

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
            <AppButton
              label="Marcar como concluído"
              variant="secondary"
              onPress={onComplete}
              style={styles.ctaBtn}
            />
          )}
        </AppCard>
    </TheoryReaderShell>
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
  ctaBtn: { marginTop: 0 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  doneRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  ok: { fontWeight: "700", color: colors.successDark },
  });
}
