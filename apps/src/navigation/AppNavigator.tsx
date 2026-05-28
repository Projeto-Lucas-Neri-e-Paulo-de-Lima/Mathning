import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ExerciseScreen } from "../screens/ExerciseScreen";
import { LearningPathScreen } from "../screens/LearningPathScreen";
import LoginScreen from "../screens/LoginScreen";
import { TheoryHubScreen } from "../screens/TheoryHubScreen";
import { TheoryScreen } from "../screens/TheoryScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  const { uid, demo, loading } = useAuthContext();
  const { colors } = useTheme();
  const shouldShowLogin = !uid;

  const screenOptions = useMemo(
    () => ({
      title: "",
      headerTitle: "",
      headerBackVisible: false,
      headerTransparent: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: "transparent",
      },
      contentStyle: {
        backgroundColor: colors.bg,
      },
      headerTintColor: colors.text,
    }),
    [colors],
  );

  if (!demo && loading && !uid) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.muted, { color: colors.muted }]}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {shouldShowLogin ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Teoria" component={TheoryHubScreen} />
          <Stack.Screen name="LearningPath" component={LearningPathScreen} />
          <Stack.Screen name="TheoryDetail" component={TheoryScreen} />
          <Stack.Screen name="Exercise" component={ExerciseScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function ThemedNavigation() {
  const { colors, isDark } = useTheme();

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.bg,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [colors, isDark]);

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack />
    </NavigationContainer>
  );
}

export function AppNavigator() {
  return (
    <AuthProvider>
      <ThemedNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  muted: {
    fontSize: 14,
  },
});
