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
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { ColorTokens } from "../theme/tokens";
import { markDemoPracticeCompleted, recordDemoExercise } from "../lib/demoProgress";
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
      <ScrollView contentContainerStyle={styles.scroll}>
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
          <Pressable style={styles.primaryBtn} onPress={resetSession}>
            <Text style={styles.primaryBtnTxt}>Praticar novamente</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnTxt}>Voltar à trilha</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    (isChoice ? selectedChoice !== null : input.trim() !== "");

  const explanation =
    practice.mode === "arithmetic"
      ? explainSolution(practice.problem)
      : explainConceptSolution(practice.problem);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.eyebrow}>Prática · {lesson.title}</Text>
      <Text style={styles.progress}>
        Questão {questionNum} de {PRACTICE_QUESTIONS_PER_SESSION}
      </Text>
      <Text style={styles.h1}>
        {practice.mode === "concept" ? practice.problem.prompt : "Qual é o resultado?"}
      </Text>
      <View style={styles.card}>
        {practice.mode === "arithmetic" ? (
          <Text style={styles.sum}>{formatProblem(practice.problem)}</Text>
        ) : null}

        {choiceProblem ? (
          <View style={styles.options}>
            {choiceProblem.options.map((opt, i) => {
              const selected = selectedChoice === i;
              return (
                <Pressable
                  key={i}
                  disabled={busy}
                  onPress={() => setSelectedChoice(i)}
                  style={[
                    styles.optionBtn,
                    selected && styles.optionBtnSelected,
                    busy && styles.disabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionTxt,
                      selected && styles.optionTxtSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={input}
            onChangeText={setInput}
            placeholder="?"
            placeholderTextColor={colors.muted}
            editable={!busy}
          />
        )}

        <Pressable
          style={[styles.primaryBtn, (!canSubmit || busy) && styles.disabled]}
          disabled={!canSubmit}
          onPress={() => void handleSubmit()}
        >
          <Text style={styles.primaryBtnTxt}>Verificar</Text>
        </Pressable>
        {feedback === "ok" && (
          <Text style={styles.ok}>Muito bem! +XP</Text>
        )}
        {feedback === "bad" && (
          <View style={styles.fbBad}>
            <Text style={styles.bad}>Não foi dessa vez.</Text>
            <Text style={styles.small}>{explanation}</Text>
          </View>
        )}
        <Text style={styles.small}>
          Acertos nesta sessão: {correctCount} · Nível {tier}
        </Text>
      </View>
    </ScrollView>
  );
}

function createExerciseStyles(colors: ColorTokens) {
  return StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  eyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.muted,
    marginBottom: 4,
  },
  progress: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 6,
  },
  h1: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 12, lineHeight: 28 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
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
  optionTxt: { fontSize: 15, color: colors.text, fontWeight: "600" },
  optionTxtSelected: { color: colors.primary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 22,
    marginBottom: 12,
    backgroundColor: colors.inputBg,
    color: colors.text,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnTxt: { color: "#fff", fontWeight: "600", fontSize: 16 },
  secondaryBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnTxt: { color: colors.text, fontWeight: "600", fontSize: 16 },
  disabled: { opacity: 0.6 },
  ok: { marginTop: 12, color: colors.successDark, fontWeight: "600" },
  fbBad: { marginTop: 12 },
  bad: { color: colors.error, fontWeight: "600" },
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
