import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  TheoryReaderProvider,
  useTheoryReader,
  type TheorySectionLink,
} from "../context/TheoryReaderContext";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { ScreenBackground } from "./ScreenBackground";
import { ScrollToTopFab } from "./ScrollToTopFab";
import { ScreenScrollView } from "./ScreenScrollView";
import { TheorySectionIndex } from "./TheorySectionIndex";
import { useTheme } from "../context/ThemeContext";

type TheoryReaderShellProps = {
  header: ReactNode;
  children: ReactNode;
  sections?: TheorySectionLink[];
  contentStyle?: StyleProp<ViewStyle>;
};

const SCROLL_TOP_THRESHOLD = 280;

function TheoryReaderShellInner({
  header,
  children,
  sections = [],
  contentStyle,
}: TheoryReaderShellProps) {
  const { colors } = useTheme();
  const { setContentRootY, scrollToSection, setScrollHandler } = useTheoryReader();
  const scrollRef = useRef<ScrollView>(null);
  const [readPct, setReadPct] = useState(0);
  const [showTopFab, setShowTopFab] = useState(false);

  useEffect(() => {
    setScrollHandler((y) => {
      scrollRef.current?.scrollTo({ y, animated: true });
    });
  }, [setScrollHandler]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const maxScroll = Math.max(0, contentSize.height - layoutMeasurement.height);
    const pct =
      maxScroll > 0
        ? Math.round((contentOffset.y / maxScroll) * 100)
        : 100;
    setReadPct(pct);
    setShowTopFab(contentOffset.y > SCROLL_TOP_THRESHOLD);
  }, []);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  return (
    <ScreenBackground>
      <ScreenScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        contentStyle={contentStyle}
      >
        {header}
        <View style={[styles.stickyBar, { backgroundColor: colors.bg }]}>
          <ReadingProgressBar percent={readPct} />
          <TheorySectionIndex
            sections={sections}
            onSelect={scrollToSection}
          />
        </View>
        <View
          style={styles.contentRoot}
          onLayout={(e) => setContentRootY(e.nativeEvent.layout.y)}
          collapsable={false}
        >
          {children}
        </View>
      </ScreenScrollView>
      <ScrollToTopFab visible={showTopFab} onPress={scrollToTop} />
    </ScreenBackground>
  );
}

export function TheoryReaderShell(props: TheoryReaderShellProps) {
  return (
    <TheoryReaderProvider>
      <TheoryReaderShellInner {...props} />
    </TheoryReaderProvider>
  );
}

/** Espaço vertical entre hero, abas, seções e cards de teoria. */
export const THEORY_SECTION_GAP = 16;

const styles = StyleSheet.create({
  stickyBar: {
    paddingBottom: 12,
    gap: 8,
    marginBottom: 4,
  },
  contentRoot: {
    gap: THEORY_SECTION_GAP,
  },
});
