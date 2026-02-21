import { ElegirContextoCards } from "./elegir-contexto-cards";

export default function ElegirContextoPage() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center animate-in fade-in duration-500 slide-in-from-bottom-4">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
        ¿A qué espacio querés entrar?
      </h1>
      <p className="mt-3 text-sm text-zinc-400 sm:text-base leading-relaxed max-w-lg mx-auto">
        Elegí un contexto para ver solo la información de ese espacio. Hasta que no elijas, no se muestra ningún dato.
      </p>
      <div className="mt-10 w-full">
        <ElegirContextoCards />
      </div>
    </div>
  );
}
