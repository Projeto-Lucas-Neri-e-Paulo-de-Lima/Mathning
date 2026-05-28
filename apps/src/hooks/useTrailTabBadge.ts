import { useMemo } from "react";
import { useAuthContext } from "../context/AuthContext";
import { countOpenTrailLessons } from "../lib/trailProgress";

export function useTrailTabBadge() {
  const { progress } = useAuthContext();

  return useMemo(() => {
    if (!progress) {
      return { show: false, count: 0 };
    }
    const count = countOpenTrailLessons(progress.completedLessonIds ?? []);
    return { show: count > 0, count };
  }, [progress]);
}
