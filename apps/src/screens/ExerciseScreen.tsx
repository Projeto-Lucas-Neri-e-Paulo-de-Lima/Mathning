import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  answersMatch,
  arithmeticProblemSignature,
  checkConceptChoiceAnswer,
  checkConceptNumericAnswer,
  conceptProblemSignature,
  explainConceptSolution,
  explainSolution,
  formatProblem,
  generateArithmeticProblemUnique,
  generateConceptProblemUnique,
  getLesson,
  markPracticeCompleted,
  parseUserAnswer,
  PRACTICE_QUESTIONS_PER_SESSION,
  recordExerciseOutcome,
  type ArithmeticProblem,
  type ConceptChoiceProblem,
  type ConceptProblem,
} from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthContext } from "../context/AuthContext";
import { AppButton } from "../components/AppButton";
import { PracticeFeedbackBanner } from "../components/PracticeFeedbackBanner";
import { ScreenScrollView } from "../components/ScreenScrollView";
import { useAppHeader } from "../hooks/useAppHeader";
import { useTheme } from "../context/ThemeContext";
import type { ColorTokens } from "../theme/tokens";
import { markDemoPracticeCompleted, recordDemoExercise } from "../lib/demoProgress";
import { triggerPracticeFeedback } from "../lib/practiceHaptics";
import { radius } from "../theme/radius";
import { isLessonUnlocked } from "../lib/progression";
import type { RootStackParamList } from "../navigation/types";

type R = RouteProp<RootStackParamList, "Exercise">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

type PracticeState =
  | { mode: "arithmetic"; problem: ArithmeticProblem }
  | { mode: "concept"; problem: ConceptProblem };

type SessionPhase = "active" | "summary";

function nextProblem(
  lesson: NonNullable<ReturnType<typeof getLesson>>,
  tier: 1 | 2 | 3,
  usedInSession: ReadonlySet<string>,
): PracticeState | null {
  if (lesson.conceptTheory) {
    const concept = generateConceptProblemUnique(lesson.id, tier, usedInSession);
    if (!concept) return null;
    return { mode: "concept", problem: concept };
  }
  return {
    mode: "arithmetic",
    problem: generateArithmeticProblemUnique(lesson.operation, tier, usedInSession),
  };
}

function initialSessionState() {
  return {
    phase: "active" as SessionPhase,
    questionNum: 1,
    correctCount: 0,
    tier: 1 as 1 | 2 | 3,
    sessionStreak: 0,
    practice: null as PracticeState | null,
    input: "",
    selectedChoice: null as number | null,
    feedback: "idle" as "idle" | "ok" | "bad",
    busy: false,
  };
}

export function ExerciseScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { moduleId, lessonId } = params;
  const { colors } = useTheme();
  const styles = useMemo(() => createExerciseStyles(colors), [colors]);
  const { progress, db, uid, demo, updateLocalDemo, refreshProgress } =
    useAuthContext();

  useAppHeader(navigation);

  const lesson = getLesson(moduleId, lessonId);
  const completed = progress?.completedLessonIds ?? [];
  const unlocked = progress
    ? isLessonUnlocked(moduleId, lessonId, completed)
    : false;

  const [phase, setPhase] = useState<SessionPhase>("active");
  const [questionNum, setQuestionNum] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [tier, setTier] = useState<1 | 2 | 3>(1);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [practice, setPractice] = useState<PracticeState | null>(null);
  const [input, setInput] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "ok" | "bad">("idle");
  const [busy, setBusy] = useState(false);
  const usedProblemSignaturesRef = useRef<Set<string>>(new Set());

  const resetSession = useCallback(() => {
    if (!lesson) return;
    usedProblemSignaturesRef.current = new Set();
    const next = initialSessionState();
    setPhase(next.phase);
    setQuestionNum(next.questionNum);
    setCorrectCount(next.correctCount);
    setTier(next.tier);
    setSessionStreak(next.sessionStreak);
    setPractice(nextProblem(lesson, 1, usedProblemSignaturesRef.current));
    setInput(next.input);
    setSelectedChoice(next.selectedChoice);
    setFeedback(next.feedback);
    setBusy(next.busy);
  }, [lesson]);

  useEffect(() => {
    resetSession();
  }, [moduleId, lessonId, resetSession]);

  async function markSessionComplete() {
    if (!progress) return;
    if (demo) {
      await updateLocalDemo(markDemoPracticeCompleted(progress, lessonId));
    } else if (db && uid) {
      await markPracticeCompleted(db, uid, lessonId);
      await refreshProgress();
    }
  }

  async function handleSubmit() {
    if (!lesson || !practice || !progress || busy || phase !== "active") return;

    let ok = false;
    if (practice.mode === "arithmetic") {
      const val = parseUserAnswer(input);
      if (val === null) return;
      ok = answersMatch(val, practice.problem.answer);
    } else if (practice.problem.kind === "choice") {
      if (selectedChoice === null) return;
      ok = checkConceptChoiceAnswer(practice.problem, selectedChoice);
    } else {
      const val = parseUserAnswer(input);
      if (val === null) return;
      ok = checkConceptNumericAnswer(practice.problem, val);
    }

    setFeedback(ok ? "ok" : "bad");
    setBusy(true);
    void triggerPracticeFeedback(ok);

    const streakAfter = ok ? sessionStreak + 1 : 0;
    const newCorrectCount = ok ? correctCount + 1 : correctCount;
    const isLastQuestion = questionNum >= PRACTICE_QUESTIONS_PER_SESSION;

    if (demo) {
      const next = recordDemoExercise(progress, ok, streakAfter, lessonId);
      await updateLocalDemo(next);
    } else if (db && uid) {
      await recordExerciseOutcome(db, uid, ok, streakAfter, lessonId);
      await refreshProgress();
    }

    let nextTier = tier;
    let nextStreak = streakAfter;
    if (ok) {
      if (streakAfter >= 3 && tier < 3) {
        nextTier = (tier + 1) as 1 | 2 | 3;
        nextStreak = 0;
      }
    } else if (tier > 1) {
      nextTier = (tier - 1) as 1 | 2 | 3;
      nextStreak = 0;
    }

    setTimeout(() => {
      setCorrectCount(newCorrectCount);
      if (isLastQuestion) {
        setPhase("summary");
        void markSessionComplete();
        setBusy(false);
        return;
      }
      const sig =
        practice.mode === "concept"
          ? conceptProblemSignature(practice.problem)
          : arithmeticProblemSignature(practice.problem);
      usedProblemSignaturesRef.current.add(sig);
      const nextPractice = nextProblem(
        lesson,
        nextTier,
        usedProblemSignaturesRef.current,
      );
      setTier(nextTier);
      setSessionStreak(nextStreak);
      setQuestionNum(questionNum + 1);
      setPractice(nextPractice);
      setInput("");
      setSelectedChoice(null);
      setFeedback("idle");
      setBusy(false);
    }, 1400);
  }

  if (!lesson || !unlocked) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Não disponível.</Text>
      </View>
    );
  }

  if (phase === "summary") {
    const pct = Math.round(
      (correctCount / PRACTICE_QUESTIONS_PER_SESSION) * 100,
    );
    const message =
      pct === 100
        ? "Perfeito! Você dominou este assunto."
        : pct >= 80
          ? "Ótimo desempenho! Continue assim."
          : pct >= 60
            ? "Bom trabalho! Vale revisar a teoria."
            : "Continue praticando — a teoria ajuda muito.";

    return (
      <ScreenScrollView contentStyle={styles.scrollExtra}>
        <Text style={styles.eyebrow}>Prática concluída</Text>
        <Text style={styles.h1}>{lesson.title}</Text>
        <View style={styles.card}>
          <View style={styles.summaryScoreWrap}>
            <Text style={styles.summaryScore}>
              {correctCount}/{PRACTICE_QUESTIONS_PER_SESSION}
            </Text>
            <Text style={styles.summaryLabel}>acertos</Text>
          </View>
          <Text style={styles.summaryPct}>{pct}% de aproveitamento</Text>
          <Text style={styles.summaryMsg}>{message}</Text>
          <AppButton label="Praticar novamente" onPress={resetSession} />
          <AppButton
            label="Voltar à trilha"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScreenScrollView>
    );
  }

  if (!practice) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Exercícios não encontrados para este assunto.</Text>
      </View>
    );
  }

  const isChoice =
    practice.mode === "concept" && practice.problem.kind === "choice";
  const choiceProblem = isChoice
    ? (practice.problem as ConceptChoiceProblem)
    : null;
  const canSubmit =
    !busy &&
    feedback === "idle" &&
    (isChoice ? selectedChoice !== null : input.trim() !== "");

  const progressPct = Math.round(
    (questionNum / PRACTICE_QUESTIONS_PER_SESSION) * 100,
  );

  const explanation =
    practice.mode === "arithmetic"
      ? explainSolution(practice.problem)
      : explainConceptSolution(practice.problem);

  return (
    <ScreenScrollView contentStyle={styles.scrollExtra}>
      <Text style={styles.eyebrow}>Prática · {lesson.title}</Text>
      <View style={styles.progressBlock}>
        <Text style={styles.progress}>
          Questão {questionNum} de {PRACTICE_QUESTIONS_PER_SESSION}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
      </View>
      <Text style={styles.h1}>
        {practice.mode === "concept" ? practice.problem.prompt : "Qual é o resultado?"}
      </Text>
      <View
        style={[
          styles.card,
          feedback === "ok" && styles.cardOk,
          feedback === "bad" && styles.cardBad,
        ]}
      >
        {practice.mode === "arithmetic" ? (
          <Text style={styles.sum}>{formatProblem(practice.problem)}</Text>
        ) : null}

        {choiceProblem ? (
          <View style={styles.options}>
            {choiceProblem.options.map((opt, i) => {
              const selected = selectedChoice === i;
              const showOk = feedback === "ok" && selected;
              const showBad = feedback === "bad" && selected;
              return (
                <Pressable
                  key={i}
                  disabled={busy}
                  onPress={() => setSelectedChoice(i)}
                  style={[
                    styles.optionBtn,
                    selected && feedback === "idle" && styles.optionBtnSelected,
                    showOk && styles.optionBtnOk,
                    showBad && styles.optionBtnBad,
                    busy && styles.disabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionTxt,
                      selected && feedback === "idle" && styles.optionTxtSelected,
                      showOk && styles.optionTxtOk,
                      showBad && styles.optionTxtBad,
                    ]}
                  >
                    {opt}
                  </Text>
                  {showOk ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  ) : null}
                  {showBad ? (
                    <Ionicons name="close-circle" size={22} color={colors.error} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <TextInput
            style={[
              styles.input,
              feedback === "ok" && styles.inputOk,
              feedback === "bad" && styles.inputBad,
            ]}
            keyboardType="numeric"
            value={input}
            onChangeText={setInput}
            placeholder="?"
            placeholderTextColor={colors.muted}
            editable={!busy}
          />
        )}

        <AppButton
          label={busy && feedback !== "idle" ? "Aguarde..." : "Verificar"}
          onPress={() => void handleSubmit()}
          disabled={!canSubmit}
        />
        {feedback === "ok" ? (
          <PracticeFeedbackBanner
            variant="ok"
            title="Muito bem!"
            message="+XP · Próxima questão em instantes"
          />
        ) : null}
        {feedback === "bad" ? (
          <PracticeFeedbackBanner
            variant="bad"
            title="Não foi dessa vez"
            message={explanation}
          />
        ) : null}
        <Text style={styles.small}>
          Acertos nesta sessão: {correctCount} · Nível {tier}
        </Text>
      </View>
    </ScreenScrollView>
  );
}

function createExerciseStyles(colors: ColorTokens) {
  return StyleSheet.create({
  scrollExtra: { paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  eyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.muted,
    marginBottom: 4,
  },
  progressBlock: { marginBottom: 12 },
  progress: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  h1: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 12, lineHeight: 28 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardOk: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  cardBad: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  sum: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: colors.text,
  },
  options: { gap: 10, marginBottom: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.cardMuted,
  },
  optionBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  optionBtnOk: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  optionBtnBad: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  optionTxt: { flex: 1, fontSize: 15, color: colors.text, fontWeight: "600" },
  optionTxtSelected: { color: colors.primary },
  optionTxtOk: { color: colors.successDark, fontWeight: "700" },
  optionTxtBad: { color: colors.errorDark, fontWeight: "700" },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 22,
    marginBottom: 12,
    backgroundColor: colors.inputBg,
    color: colors.text,
  },
  inputOk: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  inputBad: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  disabled: { opacity: 0.6 },
  small: { marginTop: 12, fontSize: 13, color: colors.muted },
  muted: { color: colors.muted },
  summaryScoreWrap: { alignItems: "center", marginBottom: 8 },
  summaryScore: { fontSize: 48, fontWeight: "800", color: colors.primary },
  summaryLabel: { fontSize: 14, color: colors.muted, fontWeight: "600" },
  summaryPct: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  summaryMsg: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  });
}
