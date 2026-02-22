import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chatService from "@/services/chat";

export const chatKeys = {
  history: ["chat", "history"] as const,
};

export function useChatHistory(limit?: number) {
  return useQuery({
    queryKey: chatKeys.history,
    queryFn: () => chatService.getChatHistory(limit),
  });
}

export function useSaveChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ role, content }: { role: "user" | "assistant"; content: string }) =>
      chatService.saveChatMessage(role, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.history }),
  });
}
