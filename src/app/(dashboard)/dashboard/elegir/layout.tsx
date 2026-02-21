/**
 * Layout específico para la pantalla "¿A qué espacio querés entrar?".
 * Fuerza fondo oscuro y pantalla completa para que el diseño se aplique
 * desde el primer paint (SSR), sin depender solo del shell en cliente.
 */
export default function ElegirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex-1 w-full min-h-0 bg-[#0a0a0b] flex flex-col items-center justify-center"
      data-screen="elegir"
    >
      {children}
    </div>
  );
}
