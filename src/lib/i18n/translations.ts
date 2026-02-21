export type Locale = "es" | "en";

export const defaultLocale: Locale = "es";

const loginStrings = {
  es: {
    title: "Iniciar sesión",
    subtitle: "Accedé con tu cuenta.",
    privateNote: "App privada. Solo usuarios autorizados.",
    email: "Correo electrónico",
    password: "Contraseña",
    rememberMe: "Recordarme",
    forgotPassword: "Olvidé mi contraseña",
    submit: "Iniciar sesión",
    submitting: "Entrando...",
    orWith: "o con",
    sessionClosed: "Sesión cerrada. Podés volver a entrar cuando quieras.",
    providerError: "Error con el proveedor. Intentá de nuevo o usá email y contraseña.",
    deniedTitle: "403 — Acceso no autorizado",
    deniedText: "Tu cuenta no está en la lista de usuarios permitidos. Solo cuentas registradas en el sistema pueden acceder.",
    errorGeneric: "Error al iniciar sesión",
    toastSuccess: "Sesión iniciada",
    toastRedirect: "Redirigiendo al dashboard…",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    google: "Iniciar sesión con Google",
    microsoft: "Iniciar sesión con Microsoft",
    apple: "Iniciar sesión con Apple",
  },
  en: {
    title: "Log in",
    subtitle: "Access your account.",
    privateNote: "Private app. Authorized users only.",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot my password",
    submit: "Log in",
    submitting: "Signing in...",
    orWith: "or with",
    sessionClosed: "Session ended. You can sign in again when you're ready.",
    providerError: "Provider error. Try again or use email and password.",
    deniedTitle: "403 — Unauthorized",
    deniedText: "Your account is not in the allowed users list. Only registered accounts can access.",
    errorGeneric: "Sign in error",
    toastSuccess: "Signed in",
    toastRedirect: "Redirecting to dashboard…",
    showPassword: "Show password",
    hidePassword: "Hide password",
    google: "Sign in with Google",
    microsoft: "Sign in with Microsoft",
    apple: "Sign in with Apple",
  },
} as const;

/** Map Supabase/auth English messages to es/en. Default Spanish (Argentina). */
const authErrorMap: Record<string, { es: string; en: string }> = {
  "Invalid login credentials": {
    es: "Usuario o contraseña incorrectos.",
    en: "Invalid email or password.",
  },
  "Email not confirmed": {
    es: "Tu correo aún no fue confirmado.",
    en: "Email not confirmed.",
  },
  "Too many requests": {
    es: "Demasiados intentos. Probá de nuevo en unos minutos.",
    en: "Too many attempts. Try again in a few minutes.",
  },
  "Invalid email or password": {
    es: "Usuario o contraseña incorrectos.",
    en: "Invalid email or password.",
  },
  "User not found": {
    es: "No existe una cuenta con ese correo.",
    en: "No account found with that email.",
  },
};

export function getLoginStrings(locale: Locale) {
  return loginStrings[locale];
}

export function translateAuthError(message: string, locale: Locale): string {
  const normalized = message.trim();
  for (const [key, value] of Object.entries(authErrorMap)) {
    if (normalized.toLowerCase().includes(key.toLowerCase())) {
      return value[locale];
    }
  }
  return locale === "es" ? "Error al iniciar sesión. Intentá de nuevo." : message;
}
