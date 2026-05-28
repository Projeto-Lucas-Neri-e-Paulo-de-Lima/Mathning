import type { UserProgressDoc } from "@mathning/shared";

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyExerciseCount(
  progress: UserProgressDoc,
  date: string = todayIso(),
): number {
  return progress.dailyExerciseDate === date
    ? (progress.dailyExerciseCount ?? 0)
    : 0;
}

/** Contagem do dia após registrar mais um exercício (antes do refresh remoto). */
export function projectedDailyAfterSubmit(
  progress: UserProgressDoc,
  date: string = todayIso(),
): number {
  if (progress.dailyExerciseDate !== date) return 1;
  return getDailyExerciseCount(progress, date) + 1;
}
