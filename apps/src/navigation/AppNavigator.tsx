import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuthContext } from "../context/AuthContext";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ExerciseScreen } from "../screens/ExerciseScreen";
import { LearningPathScreen } from "../screens/LearningPathScreen";
import LoginScreen from "../screens/LoginScreen";
import { TheoryHubScreen } from "../screens/TheoryHubScreen";
import { TheoryScreen } from "../screens/TheoryScreen";
import { PerformanceScreen } from "../screens/PerformanceScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { colors } from "../theme/colors";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
  },
};

function RootStack() {
  const { uid, demo, loading } = useAuthContext();
  const shouldShowLogin = !uid;

  if (!demo && loading && !uid) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      {shouldShowLogin ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: "Mathning" }}
          />
          <Stack.Screen
            name="Teoria"
            component={TheoryHubScreen}
            options={{ title: "Teoria" }}
          />
          <Stack.Screen
            name="LearningPath"
            component={LearningPathScreen}
            options={{ title: "Trilha" }}
          />
          <Stack.Screen
            name="TheoryDetail"
            component={TheoryScreen}
            options={{ title: "Teoria" }}
          />
          <Stack.Screen
            name="Exercise"
            component={ExerciseScreen}
            options={{ title: "Prática" }}
          />
          <Stack.Screen
            name="Performance"
            component={PerformanceScreen}
            options={{ title: "Desempenho" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Perfil" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer theme={theme}>
        <RootStack />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.bg,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
  },
});
