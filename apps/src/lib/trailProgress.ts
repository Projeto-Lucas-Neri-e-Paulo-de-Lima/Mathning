import { MODULES } from "@mathning/shared";
import { isLessonUnlocked } from "./progression";

/** Lições desbloqueadas e ainda não concluídas na trilha. */
export function countOpenTrailLessons(completedLessonIds: string[]): number {
  const completed = completedLessonIds ?? [];
  let count = 0;
  for (const mod of MODULES) {
    if (!mod.available) continue;
    for (const lesson of mod.lessons) {
      if (
        isLessonUnlocked(mod.id, lesson.id, completed) &&
        !completed.includes(lesson.id)
      ) {
        count += 1;
      }
    }
  }
  return count;
}

export function hasTrailActionPending(completedLessonIds: string[]): boolean {
  return countOpenTrailLessons(completedLessonIds) > 0;
}
