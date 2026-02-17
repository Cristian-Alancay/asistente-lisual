"use client";

import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, Send, User } from "lucide-react";

type HistoryMsg = { id: string; role: string; content: string; created_at: string };

function toUIMessage(m: HistoryMsg) {
  return {
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
  };
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const { messages, sendMessage, status, setMessages } = useChat();

  useEffect(() => {
    fetch("/api/chat/history?limit=50")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: HistoryMsg[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map(toUIMessage));
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [setMessages]);

  const isLoading = status === "streaming" || status === "submitted";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Asistente Lisual</h1>
        <p className="text-muted-foreground">
          Chat con IA. Puedes crear leads, consultar presupuestos y listar contactos.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-lg">Conversación</CardTitle>
          <CardDescription>
            Escribe para interactuar. El asistente puede crear leads, consultar presupuestos y más.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {!historyLoaded ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Cargando historial...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                  <Bot className="h-12 w-12" />
                  <p>Hola, soy el asistente de Lisual. ¿En qué puedo ayudarte?</p>
                  <p className="text-sm">
                    Puedes pedirme crear un lead, consultar presupuestos o listar leads.
                  </p>
                </div>
              ) : null}
              {historyLoaded && messages.map((message) => (
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
                    <div className="mt-1 space-y-1 break-words">
                      {"parts" in message &&
                        message.parts?.map((part: { type?: string; text?: string }, i: number) => {
                          if (part.type === "text" && part.text) {
                            return (
                              <p key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                                {part.text}
                              </p>
                            );
                          }
                          if (
                            part.type?.startsWith("tool-") &&
                            "output" in part &&
                            typeof (part as { output?: string }).output === "string"
                          ) {
                            return (
                              <p
                                key={`${message.id}-${i}`}
                                className="text-xs opacity-80 italic"
                              >
                                {(part as { output: string }).output}
                              </p>
                            );
                          }
                          return null;
                        })}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
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
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
