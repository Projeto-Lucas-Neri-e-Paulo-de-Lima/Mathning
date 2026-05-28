import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { useTheoryReaderOptional } from "../context/TheoryReaderContext";

type TheorySectionProps = ViewProps & {
  sectionId: string;
  children: ReactNode;
};

export function TheorySection({ sectionId, children, style, ...rest }: TheorySectionProps) {
  const reader = useTheoryReaderOptional();

  return (
    <View
      {...rest}
      style={style}
      onLayout={(e) => {
        reader?.registerSectionOffset(sectionId, e.nativeEvent.layout.y);
        rest.onLayout?.(e);
      }}
    >
      {children}
    </View>
  );
}
