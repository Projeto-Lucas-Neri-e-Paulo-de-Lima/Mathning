import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenBackground } from "../components/ScreenBackground";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

const Logo = require("../../assets/mathning_sem_fundo.png");

type AuthMode = "signIn" | "signUp";

export default function LoginScreen() {
  const { colors, cardShadow, isDark } = useTheme();
  const styles = useMemo(
    () => createLoginStyles(colors, cardShadow),
    [colors, cardShadow],
  );
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const { demo, signIn, signUp, resetPassword, continueDemo } =
    useAuthContext();

  const isSignUp = mode === "signUp";

  async function handleSubmit() {
    const cleanEmail = email.trim();
    setFormError(null);
    setInfo(null);

    if (demo) {
      setFormError("Configure o Firebase em apps/.env para usar login real.");
      return;
    }

    if (isSignUp && nome.trim().length < 2) {
      setFormError("Digite seu nome (mínimo 2 caracteres).");
      return;
    }

    if (!cleanEmail || !senha) {
      setFormError("Preencha email e senha para continuar.");
      return;
    }

    if (isSignUp && senha.length < 6) {
      setFormError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      if (isSignUp) {
        await signUp(cleanEmail, senha, nome.trim());
      } else {
        await signIn(cleanEmail, senha);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Nao foi possivel entrar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    const cleanEmail = email.trim();
    setFormError(null);
    setInfo(null);

    if (demo) {
      setFormError("Configure o Firebase em apps/.env para recuperar senha.");
      return;
    }

    if (!cleanEmail) {
      setFormError("Digite seu email para recuperar a senha.");
      return;
    }

    try {
      setSubmitting(true);
      await resetPassword(cleanEmail);
      setInfo("Enviamos um email com instrucoes para redefinir sua senha.");
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Nao foi possivel recuperar a senha.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setMode(isSignUp ? "signIn" : "signUp");
    if (isSignUp) setNome("");
    setFormError(null);
    setInfo(null);
  }

  async function handleContinueDemo() {
    setFormError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await continueDemo();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bg}
      />
      <ScreenBackground style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
          <View style={styles.header}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Bem-vindo ao Mathning</Text>
            <Text style={styles.subtitle}>
              Entre para continuar sua trilha e salvar seu progresso no Firebase.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isSignUp ? "Criar conta" : "Entrar"}
            </Text>

            {demo ? (
              <View style={styles.messageInfo}>
                <Text style={styles.messageInfoText}>
                  Firebase ainda nao configurado. Preencha apps/.env e reinicie
                  com npm run start:clear (ou expo start ./apps --clear).
                </Text>
              </View>
            ) : null}

            {isSignUp ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Como quer ser chamado?"
                  placeholderTextColor={colors.muted}
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  textContentType="name"
                  editable={!submitting}
                />
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                editable={!submitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.muted}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType={isSignUp ? "newPassword" : "password"}
                editable={!submitting}
                onSubmitEditing={() => void handleSubmit()}
              />
            </View>

            {formError ? (
              <View style={styles.messageError}>
                <Text style={styles.messageErrorText}>{formError}</Text>
              </View>
            ) : null}

            {info ? (
              <View style={styles.messageInfo}>
                <Text style={styles.messageInfoText}>{info}</Text>
              </View>
            ) : null}

            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => void handlePasswordReset()}
                disabled={submitting}
                accessibilityRole="button"
              >
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.loginButton,
                submitting && styles.disabledButton,
              ]}
              onPress={() => void handleSubmit()}
              disabled={submitting}
              accessibilityRole="button"
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {isSignUp ? "Criar conta" : "Entrar"}
                </Text>
              )}
            </TouchableOpacity>

            {demo ? (
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => void handleContinueDemo()}
                disabled={submitting}
                accessibilityRole="button"
              >
                <Text style={styles.demoButtonText}>
                  Continuar em demonstracao
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignUp ? "Ja tem conta?" : "Ainda nao tem conta?"}
            </Text>
            <TouchableOpacity
              onPress={toggleMode}
              disabled={submitting}
              accessibilityRole="button"
            >
              <Text style={styles.footerLink}>
                {isSignUp ? " Entrar" : " Criar conta"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

function createLoginStyles(
  colors: ColorTokens,
  cardShadow: ReturnType<typeof import("../theme/ui").createCardShadow>,
) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: { flex: 1 },

  keyboard: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    width: 300,
    height: 120,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.hero,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...cardShadow,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.cardMuted,
    fontSize: 15,
    color: colors.text,
  },

  messageError: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  messageErrorText: {
    color: colors.errorDark,
    fontSize: 13,
    lineHeight: 18,
  },

  messageInfo: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  messageInfoText: {
    color: colors.infoText,
    fontSize: 13,
    lineHeight: 18,
  },

  forgotButton: {
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 2,
  },

  forgotText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },

  loginButton: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.72,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  demoButton: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: colors.card,
  },

  demoButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  footerText: {
    fontSize: 14,
    color: colors.muted,
  },

  footerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
  });
}
