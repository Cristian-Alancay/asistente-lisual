export type Locale = "es" | "en";

export const defaultLocale: Locale = "es";

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
const sidebarStrings = {
  es: {
    appName: "NOMOS",
    subtitle: "Asistente Personal",
    pickSpace: "Elegi un espacio",
    context: "Contexto",
    work: "Trabajo",
    workTooltip: "Trabajo (laboral)",
    personal: "Cristian Alancay",
    personalTooltip: "Cristian Alancay (personal)",
    general: "General",
    dashboard: "Dashboard",
    planning: "Planificación",
    chat: "Chat",
    sales: "Ventas",
    leads: "Leads",
    quotes: "Presupuestos",
    biblioteca: "Biblioteca",
    meetings: "Reuniones",
    operations: "Operaciones",
    installations: "Instalaciones",
    calendar: "Calendario",
    experience: "CX — Experiencia",
    clients: "Clientes",
    closer: "Closer",
    reports: "Reportes",
    system: "Sistema",
    settings: "Configuración",
    tasks: "Tareas",
    notes: "Notas",
    logout: "Cerrar sesión",
  },
  en: {
    appName: "NOMOS",
    subtitle: "Personal Assistant",
    pickSpace: "Pick a space",
    context: "Context",
    work: "Work",
    workTooltip: "Work (business)",
    personal: "Cristian Alancay",
    personalTooltip: "Cristian Alancay (personal)",
    general: "General",
    dashboard: "Dashboard",
    planning: "Planning",
    chat: "Chat",
    sales: "Sales",
    leads: "Leads",
    quotes: "Quotes",
    biblioteca: "Library",
    meetings: "Meetings",
    operations: "Operations",
    installations: "Installations",
    calendar: "Calendar",
    experience: "CX — Experience",
    clients: "Clients",
    closer: "Closer",
    reports: "Reports",
    system: "System",
    settings: "Settings",
    tasks: "Tasks",
    notes: "Notes",
    logout: "Log out",
  },
} as const;

// ---------------------------------------------------------------------------
// Common actions & UI
// ---------------------------------------------------------------------------
const commonStrings = {
  es: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    add: "Agregar",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpiar",
    apply: "Aplicar",
    export: "Exportar",
    loading: "Cargando...",
    noData: "Sin datos",
    confirm: "Confirmar",
    back: "Volver",
    close: "Cerrar",
    yes: "Sí",
    no: "No",
    actions: "Acciones",
    details: "Detalles",
    status: "Estado",
    date: "Fecha",
    name: "Nombre",
    email: "Email",
    phone: "Teléfono",
    notes: "Notas",
    description: "Descripción",
    total: "Total",
    errorGeneric: "Ocurrió un error. Intentá de nuevo.",
    successSaved: "Guardado correctamente",
    successDeleted: "Eliminado correctamente",
    confirmDelete: "¿Estás seguro de que querés eliminar esto?",
  },
  en: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    add: "Add",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    apply: "Apply",
    export: "Export",
    loading: "Loading...",
    noData: "No data",
    confirm: "Confirm",
    back: "Back",
    close: "Close",
    yes: "Yes",
    no: "No",
    actions: "Actions",
    details: "Details",
    status: "Status",
    date: "Date",
    name: "Name",
    email: "Email",
    phone: "Phone",
    notes: "Notes",
    description: "Description",
    total: "Total",
    errorGeneric: "Something went wrong. Please try again.",
    successSaved: "Saved successfully",
    successDeleted: "Deleted successfully",
    confirmDelete: "Are you sure you want to delete this?",
  },
} as const;

// ---------------------------------------------------------------------------
// Page headers
// ---------------------------------------------------------------------------
const pageStrings = {
  es: {
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Resumen general del sistema",
    leadsTitle: "Leads",
    leadsSubtitle: "Gestión de contactos y prospectos",
    quotesTitle: "Presupuestos",
    quotesSubtitle: "Gestión de presupuestos y cotizaciones",
    clientsTitle: "Clientes",
    clientsSubtitle: "Clientes convertidos",
    operationsTitle: "Operaciones",
    operationsSubtitle: "Proyectos y equipos",
    installationsTitle: "Instalaciones",
    installationsSubtitle: "Estado de instalaciones",
    planningTitle: "Planificación",
    planningSubtitle: "Reuniones y tareas del día",
    calendarTitle: "Calendario",
    calendarSubtitle: "Vista mensual de eventos",
    bibliotecaTitle: "Biblioteca Comercial",
    bibliotecaSubtitle: "Casos de éxito, contenido y material de ventas",
    reunionesTitle: "Reuniones",
    reunionesSubtitle: "Historial de meetings con resumen AI, transcripción y action items",
    experienceTitle: "CX — Experiencia al Cliente",
    experienceSubtitle: "Clientes, solicitudes de video, revisiones y referencias",
    reportsTitle: "Reportes y métricas",
    reportsSubtitle: "Resumen de ventas, operaciones y experiencia al cliente",
    chatTitle: "Chat con IA",
    chatSubtitle: "Asistente inteligente",
    settingsTitle: "Configuración",
    settingsSubtitle: "Ajustes del sistema",
    personalTitle: "Cristian Alancay",
    personalSubtitle: "Espacio personal",
    personalTasksTitle: "Tareas",
    personalCalendarTitle: "Calendario",
    personalNotesTitle: "Notas",
    personalSettingsTitle: "Configuración personal",
  },
  en: {
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "System overview",
    leadsTitle: "Leads",
    leadsSubtitle: "Contact and prospect management",
    quotesTitle: "Quotes",
    quotesSubtitle: "Quote and proposal management",
    clientsTitle: "Clients",
    clientsSubtitle: "Converted clients",
    operationsTitle: "Operations",
    operationsSubtitle: "Projects and equipment",
    installationsTitle: "Installations",
    installationsSubtitle: "Installation status",
    planningTitle: "Planning",
    planningSubtitle: "Meetings and daily tasks",
    calendarTitle: "Calendar",
    calendarSubtitle: "Monthly event view",
    bibliotecaTitle: "Sales Library",
    bibliotecaSubtitle: "Success stories, content and sales materials",
    reunionesTitle: "Meetings",
    reunionesSubtitle: "Meeting history with AI summary, transcript and action items",
    experienceTitle: "CX — Customer Experience",
    experienceSubtitle: "Clients, video requests, reviews and referrals",
    reportsTitle: "Reports & Metrics",
    reportsSubtitle: "Sales, operations and customer experience overview",
    chatTitle: "AI Chat",
    chatSubtitle: "Smart assistant",
    settingsTitle: "Settings",
    settingsSubtitle: "System settings",
    personalTitle: "Cristian Alancay",
    personalSubtitle: "Personal space",
    personalTasksTitle: "Tasks",
    personalCalendarTitle: "Calendar",
    personalNotesTitle: "Notes",
    personalSettingsTitle: "Personal settings",
  },
} as const;

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
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

export function getSidebarStrings(locale: Locale) {
  return sidebarStrings[locale];
}

export function getCommonStrings(locale: Locale) {
  return commonStrings[locale];
}

export function getPageStrings(locale: Locale) {
  return pageStrings[locale];
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
