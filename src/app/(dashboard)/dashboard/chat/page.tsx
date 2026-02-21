"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, AlertCircle, Loader2, MessageSquarePlus, Send, User } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type HistoryMsg = { id: string; role: string; content: string; created_at: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/api/chat/history?limit=50", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: HistoryMsg[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(
            data
              .filter((m) => m.role === "user" || m.role === "assistant")
              .map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
          );
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
      };
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const allMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Error de red" }));
          throw new Error(err.error || `Error ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let added = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          const captured = fullText;

          if (!added) {
            setMessages((prev) => [
              ...prev,
              { id: assistantId, role: "assistant", content: captured },
            ]);
            added = true;
          } else {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: captured } : m))
            );
          }
        }

        if (!fullText.trim() && !added) {
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: "(Sin respuesta)" },
          ]);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Error al enviar mensaje");
      } finally {
        abortRef.current = null;
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
  }

  function handleNuevaConversacion() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }

  const isStreaming =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.content !== "";

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assistant Cristian Alancay</h1>
        <p className="text-muted-foreground">
          Chat con IA. Puedes crear leads, consultar presupuestos y listar contactos.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b py-4">
          <div>
            <CardTitle className="text-lg">Conversación</CardTitle>
            <CardDescription>
              Escribe para interactuar. El asistente puede crear leads, consultar presupuestos y más.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleNuevaConversacion} disabled={isLoading}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Nueva conversación
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          {error && (
            <Alert variant="destructive" className="mx-4 mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {!historyLoaded ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Cargando historial...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                  <Bot className="h-12 w-12" />
                  <p>Hola, soy el Assistant Cristian Alancay. ¿En qué puedo ayudarte?</p>
                  <p className="text-sm">
                    Puedes pedirme crear un lead, consultar presupuestos o listar leads.
                  </p>
                </div>
              ) : null}
              {historyLoaded &&
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-medium opacity-80">
                        {message.role === "user" ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        {message.role === "user" ? "Tú" : "Asistente"}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap wrap-break-word">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              {isLoading && !isStreaming && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 animate-pulse text-primary" />
                  </div>
                  <div className="rounded-lg bg-muted px-4 py-2">
                    <span className="animate-pulse text-muted-foreground">...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
