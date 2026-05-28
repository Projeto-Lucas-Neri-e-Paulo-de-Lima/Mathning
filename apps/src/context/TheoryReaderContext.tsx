import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type TheorySectionLink = {
  id: string;
  title: string;
};

type TheoryReaderContextValue = {
  contentRootY: number;
  setContentRootY: (y: number) => void;
  registerSectionOffset: (id: string, localY: number) => void;
  scrollToSection: (id: string) => void;
  setScrollHandler: (fn: (y: number) => void) => void;
};

const TheoryReaderContext = createContext<TheoryReaderContextValue | null>(null);

export function TheoryReaderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [contentRootY, setContentRootY] = useState(0);
  const sectionOffsets = useRef<Record<string, number>>({});
  const scrollHandler = useRef<(y: number) => void>(() => {});

  const registerSectionOffset = useCallback((id: string, localY: number) => {
    sectionOffsets.current[id] = localY;
  }, []);

  const setScrollHandler = useCallback((fn: (y: number) => void) => {
    scrollHandler.current = fn;
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const localY = sectionOffsets.current[id];
      if (localY == null) return;
      const targetY = Math.max(0, contentRootY + localY - 12);
      scrollHandler.current(targetY);
    },
    [contentRootY],
  );

  const value = useMemo(
    () => ({
      contentRootY,
      setContentRootY,
      registerSectionOffset,
      scrollToSection,
      setScrollHandler,
    }),
    [contentRootY, registerSectionOffset, scrollToSection, setScrollHandler],
  );

  return (
    <TheoryReaderContext.Provider value={value}>
      {children}
    </TheoryReaderContext.Provider>
  );
}

export function useTheoryReader(): TheoryReaderContextValue {
  const ctx = useContext(TheoryReaderContext);
  if (!ctx) {
    throw new Error("useTheoryReader deve ser usado dentro de TheoryReaderProvider");
  }
  return ctx;
}

export function useTheoryReaderOptional(): TheoryReaderContextValue | null {
  return useContext(TheoryReaderContext);
}
