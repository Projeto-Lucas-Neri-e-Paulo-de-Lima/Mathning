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
  DAILY_GOAL_EXERCISES,
  PRACTICE_QUESTIONS_PER_SESSION,
  recordExerciseOutcome,
  type ArithmeticProblem,
  type ConceptChoiceProblem,
  type ConceptProblem,
} from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
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
import { useToast } from "../context/ToastContext";
import { AppButton } from "../components/AppButton";
import { EmptyState } from "../components/EmptyState";
import { LessonFlowBar } from "../components/LessonFlowBar";
import { PracticeFeedbackBanner } from "../components/PracticeFeedbackBanner";
import { PracticeProgressHeader } from "../components/PracticeProgressHeader";
import { ScreenBackground } from "../components/ScreenBackground";
import { ScreenScrollView } from "../components/ScreenScrollView";
import { useAppHeader } from "../hooks/useAppHeader";
import { useScreenHeaderInset } from "../hooks/useScreenHeaderInset";
import { useTheme } from "../context/ThemeContext";
import type { ColorTokens } from "../theme/tokens";
import { triggerPracticeFeedback, triggerSuccess } from "../lib/appHaptics";
import {
  getDailyExerciseCount,
  projectedDailyAfterSubmit,
  todayIso,
} from "../lib/dailyGoal";
import { markDemoPracticeCompleted, recordDemoExercise } from "../lib/demoProgress";
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
  const headerInset = useScreenHeaderInset();
  const { showToast } = useToast();
  const sessionCompleteNotified = useRef(false);

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

  useEffect(() => {
    if (phase !== "summary") {
      sessionCompleteNotified.current = false;
      return;
    }
    if (sessionCompleteNotified.current) return;
    sessionCompleteNotified.current = true;
    showToast({ message: "Sessão de prática concluída!", variant: "success" });
    void triggerSuccess();
  }, [phase, showToast]);

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
    const today = todayIso();
    const dailyBefore = getDailyExerciseCount(progress, today);

    if (demo) {
      const next = recordDemoExercise(progress, ok, streakAfter, lessonId);
      await updateLocalDemo(next);
      const dailyAfter = getDailyExerciseCount(next, today);
      if (
        dailyBefore < DAILY_GOAL_EXERCISES &&
        dailyAfter >= DAILY_GOAL_EXERCISES
      ) {
        showToast({ message: "Meta diária concluída!", variant: "success", duration: 3200 });
        void triggerSuccess();
      }
    } else if (db && uid) {
      const dailyAfter = projectedDailyAfterSubmit(progress, today);
      await recordExerciseOutcome(db, uid, ok, streakAfter, lessonId);
      await refreshProgress();
      if (
        dailyBefore < DAILY_GOAL_EXERCISES &&
        dailyAfter >= DAILY_GOAL_EXERCISES
      ) {
        showToast({ message: "Meta diária concluída!", variant: "success", duration: 3200 });
        void triggerSuccess();
      }
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

  if (!lesson) {
    return (
      <ScreenBackground>
        <View style={styles.center}>
          <EmptyState
            title="Assunto não encontrado"
            message="Não achamos este conteúdo. Volte e escolha outro assunto na trilha."
            actionLabel="Voltar"
            onAction={() => navigation.goBack()}
            actionVariant="secondary"
          />
        </View>
      </ScreenBackground>
    );
  }

  if (!unlocked) {
    return (
      <ScreenBackground>
        <View style={styles.center}>
          <EmptyState
            title="Ainda bloqueado"
            message="Complete os assuntos anteriores na trilha para liberar a prática."
            actionLabel="Ir para a trilha"
            onAction={() => navigation.navigate("LearningPath")}
          />
        </View>
      </ScreenBackground>
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
        <LessonFlowBar
          navigation={navigation}
          moduleId={moduleId}
          lessonId={lessonId}
          lessonTitle={lesson.title}
          mode="practice"
        />
        <Text style={styles.eyebrow}>Prática concluída</Text>
        <Text style={styles.h1} accessibilityRole="header">
          {lesson.title}
        </Text>
        <View
          style={styles.card}
          accessibilityLabel={`Resultado da sessão: ${correctCount} acertos de ${PRACTICE_QUESTIONS_PER_SESSION}, ${pct} por cento. ${message}`}
        >
          <View
            style={styles.summaryScoreWrap}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text style={styles.summaryScore}>
              {correctCount}/{PRACTICE_QUESTIONS_PER_SESSION}
            </Text>
            <Text style={styles.summaryLabel}>acertos</Text>
          </View>
          <Text style={styles.summaryPct}>{pct}% de aproveitamento</Text>
          <Text style={styles.summaryMsg}>{message}</Text>
          <AppButton
            label="Praticar novamente"
            onPress={resetSession}
            accessibilityHint="Inicia uma nova sessão com cinco questões"
          />
          <AppButton
            label="Voltar à trilha"
            variant="secondary"
            onPress={() => navigation.goBack()}
            accessibilityHint="Retorna à lista de assuntos"
          />
        </View>
      </ScreenScrollView>
    );
  }

  if (!practice) {
    return (
      <ScreenBackground>
        <View style={styles.center}>
          <EmptyState
            title="Sem exercícios por aqui"
            message="Este assunto ainda não tem prática. Leia a teoria ou escolha outro tópico."
            actionLabel="Voltar à trilha"
            onAction={() => navigation.goBack()}
            actionVariant="secondary"
          />
        </View>
      </ScreenBackground>
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

  const explanation =
    practice.mode === "arithmetic"
      ? explainSolution(practice.problem)
      : explainConceptSolution(practice.problem);

  return (
    <ScreenBackground>
      <View style={[styles.fixedTop, { paddingTop: headerInset }]}>
        <LessonFlowBar
          navigation={navigation}
          moduleId={moduleId}
          lessonId={lessonId}
          lessonTitle={lesson.title}
          mode="practice"
        />
        <PracticeProgressHeader
          questionNum={questionNum}
          total={PRACTICE_QUESTIONS_PER_SESSION}
        />
      </View>
      <ScrollView
        style={styles.practiceScroll}
        contentContainerStyle={styles.scrollExtra}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text
        style={styles.h1}
        accessibilityRole="header"
      >
        {practice.mode === "concept" ? practice.problem.prompt : "Qual é o resultado?"}
      </Text>
      <View
        style={[
          styles.card,
          feedback === "ok" && styles.cardOk,
          feedback === "bad" && styles.cardBad,
        ]}
        accessibilityLabel="Área da questão"
      >
        {practice.mode === "arithmetic" ? (
          <Text
            style={styles.sum}
            accessibilityLabel={`Conta: ${formatProblem(practice.problem)}`}
          >
            {formatProblem(practice.problem)}
          </Text>
        ) : null}

        {choiceProblem ? (
          <View
            style={styles.options}
            accessibilityRole="radiogroup"
            accessibilityLabel="Alternativas da questão"
          >
            {choiceProblem.options.map((opt, i) => {
              const selected = selectedChoice === i;
              const showOk = feedback === "ok" && selected;
              const showBad = feedback === "bad" && selected;
              const optionHint =
                feedback === "idle"
                  ? "Seleciona esta alternativa"
                  : showOk
                    ? "Resposta correta"
                    : showBad
                      ? "Resposta incorreta"
                      : undefined;
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
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: busy }}
                  accessibilityLabel={`Opção ${i + 1}: ${opt}`}
                  accessibilityHint={optionHint}
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
            accessibilityLabel="Resposta numérica"
            accessibilityHint="Digite o resultado da conta"
            accessibilityState={{
              disabled: busy,
            }}
          />
        )}

        <AppButton
          label={busy && feedback !== "idle" ? "Aguarde..." : "Verificar"}
          onPress={() => void handleSubmit()}
          disabled={!canSubmit}
          loading={busy && feedback !== "idle"}
          accessibilityLabel="Verificar resposta"
          accessibilityHint="Confere se a sua resposta está correta"
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
      </ScrollView>
    </ScreenBackground>
  );
}

function createExerciseStyles(colors: ColorTokens) {
  return StyleSheet.create({
  fixedTop: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    zIndex: 2,
  },
  practiceScroll: { flex: 1 },
  scrollExtra: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: colors.bg,
    flexGrow: 1,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  eyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.muted,
    marginBottom: 4,
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
