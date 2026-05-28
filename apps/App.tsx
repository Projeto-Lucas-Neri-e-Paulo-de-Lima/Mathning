import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configureAccessibleText } from "./src/lib/configureAccessibleText";
import { FontGate } from "./src/components/FontGate";
import { ToastProvider } from "./src/context/ToastContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

function AppStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

configureAccessibleText();

export default function App() {
  return (
    <SafeAreaProvider>
      <FontGate>
        <ThemeProvider>
          <ToastProvider>
            <AppNavigator />
            <AppStatusBar />
          </ToastProvider>
        </ThemeProvider>
      </FontGate>
    </SafeAreaProvider>
  );
}
