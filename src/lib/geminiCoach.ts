import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  message: string;
  error?: string;
}

export const sendChatMessage = async (
  messages: Message[],
  yellowcakeData?: Record<string, unknown>,
  targetAudience?: string
): Promise<string> => {
  const { data, error } = await supabase.functions.invoke<ChatResponse>("gemini-coach", {
    body: {
      messages,
      yellowcakeData,
      targetAudience,
    },
  });

  if (error) {
    console.error("Error calling gemini-coach:", error);
    throw new Error(error.message || "Failed to get AI response");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.message || "I'm having trouble responding. Please try again.";
};

// Save chat message to database
export const saveChatMessage = async (
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  profileId?: string
) => {
  const { error } = await supabase.from("chat_history").insert({
    session_id: sessionId,
    role,
    content,
    profile_id: profileId,
  });

  if (error) {
    console.error("Error saving chat message:", error);
  }
};

// Load chat history
export const loadChatHistory = async (sessionId: string) => {
  const { data, error } = await supabase
    .from("chat_history")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading chat history:", error);
    return [];
  }

  return data.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));
};
