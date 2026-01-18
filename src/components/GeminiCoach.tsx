import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { IconCircle } from "@/components/ui/icon-circle";
import {
  ChatMessage,
  TypingIndicator,
  ChatInput,
  ProfileUpdatePreview,
  type Message,
} from "@/components/coach";
import type { UserProfile } from "@/types/profile";
import { getCoachWelcomeMessage, buildCoachSystemPrompt } from "@/prompts";

interface GeminiCoachProps {
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;

export const GeminiCoach = ({ profile, onProfileUpdate }: GeminiCoachProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: getCoachWelcomeMessage(!!profile?.yellowcakeData),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Attempts to coerce an update object into the correct format
   * Returns { update, wasCoerced: boolean }
   */
  const coerceUpdateFormat = (update: any): { update: any; wasCoerced: boolean } => {
    if (!update || typeof update !== "object" || !update.field || !update.action) {
      return { update, wasCoerced: false };
    }

    const originalUpdate = JSON.parse(JSON.stringify(update)); // Deep clone for logging
    let wasCoerced = false;

    // Coerce promptAnswers replace: if data is an object instead of array, wrap it
    if (update.field === "promptAnswers" && update.action === "replace") {
      if (update.data && typeof update.data === "object" && !Array.isArray(update.data)) {
        // Check if it looks like a single prompt object
        if (update.data.promptText && update.data.answerText) {
          console.log("[Coach] Coercion applied: Wrapping single prompt object into array", {
            before: originalUpdate,
            after: { ...update, data: [update.data] },
          });
          update.data = [update.data];
          wasCoerced = true;
        }
      }
    }

    // Coerce bio replace: normalize string vs object format
    if (update.field === "bio" && update.action === "replace") {
      if (update.data && typeof update.data === "object" && !update.data.bio) {
        // If object doesn't have bio property but has text-like property, try to extract
        const textValue = update.data.text || update.data.content || update.data.bio;
        if (typeof textValue === "string") {
          console.log("[Coach] Coercion applied: Extracting bio text from object", {
            before: originalUpdate,
            after: { ...update, data: textValue },
          });
          update.data = textValue;
          wasCoerced = true;
        }
      }
    }

    // Coerce promptAnswers add: ensure it's an object (not array)
    if (update.field === "promptAnswers" && update.action === "add") {
      if (Array.isArray(update.data) && update.data.length > 0) {
        // If it's an array, take the first element
        console.log("[Coach] Coercion applied: Extracting first element from array for add action", {
          before: originalUpdate,
          after: { ...update, data: update.data[0] },
        });
        update.data = update.data[0];
        wasCoerced = true;
      }
    }

    // Coerce funFacts replace: if data is an object instead of array, wrap it
    if (update.field === "funFacts" && update.action === "replace") {
      if (update.data && typeof update.data === "object" && !Array.isArray(update.data)) {
        // Check if it looks like a single fun fact object
        if (update.data.label && update.data.value) {
          console.log("[Coach] Coercion applied: Wrapping single fun fact object into array", {
            before: originalUpdate,
            after: { ...update, data: [update.data] },
          });
          update.data = [update.data];
          wasCoerced = true;
        }
      }
    }

    return { update, wasCoerced };
  };

  /**
   * Validates that an update object has the correct structure for its field/action combination
   */
  const validateUpdateStructure = (update: any): boolean => {
    if (!update || typeof update !== "object") return false;
    if (!update.field || !update.action) return false;

    // Validate based on field and action
    if (update.field === "promptAnswers") {
      if (update.action === "replace") {
        // Must be an array
        return Array.isArray(update.data);
      } else if (update.action === "add") {
        // Must be an object with promptText and answerText
        return (
          update.data &&
          typeof update.data === "object" &&
          typeof update.data.promptText === "string" &&
          typeof update.data.answerText === "string"
        );
      }
    } else if (update.field === "bio" && update.action === "replace") {
      // Can be string or object with bio property
      return (
        typeof update.data === "string" ||
        (update.data && typeof update.data === "object" && typeof update.data.bio === "string")
      );
    } else if (update.field === "funFacts") {
      if (update.action === "replace") {
        // Must be an array of objects with label and value
        return (
          Array.isArray(update.data) &&
          update.data.every(
            (item: any) =>
              item &&
              typeof item === "object" &&
              typeof item.label === "string" &&
              typeof item.value === "string"
          )
        );
      } else if (update.action === "add") {
        // Must be object with label and value
        return (
          update.data &&
          typeof update.data === "object" &&
          typeof update.data.label === "string" &&
          typeof update.data.value === "string"
        );
      }
    }

    // Unknown field/action combination - consider invalid
    return false;
  };

  const parseProfileUpdate = (content: string): { text: string; update: any | null; isValid: boolean } => {
    console.log("[Coach] Raw response received", content);

    const updateMatch = content.match(/```json:profile_update\s*([\s\S]*?)```/);
    if (updateMatch) {
      const jsonStr = updateMatch[1].trim();
      console.log("[Coach] Update JSON found", jsonStr);

      try {
        const parsedUpdate = JSON.parse(jsonStr);
        console.log("[Coach] Parsed update", parsedUpdate);

        const text = content.replace(/```json:profile_update[\s\S]*?```/g, "").trim();

        // Try coercion first
        const { update, wasCoerced } = coerceUpdateFormat(parsedUpdate);

        if (wasCoerced) {
          console.log("[Coach] Coercion applied", {
            original: parsedUpdate,
            coerced: update,
          });
        }

        // Validate the update structure
        const isValid = validateUpdateStructure(update);

        if (isValid) {
          console.log("[Coach] Validation passed", {
            field: update.field,
            action: update.action,
            dataType: Array.isArray(update.data) ? "array" : typeof update.data,
          });
          console.log("[Coach] Final update", update);
          return { text, update, isValid: true };
        } else {
          console.warn("[Coach] Validation failed", {
            update,
            field: update?.field,
            action: update?.action,
            dataType: update?.data ? (Array.isArray(update.data) ? "array" : typeof update.data) : "undefined",
            expected: update?.field === "promptAnswers" && update?.action === "replace" ? "array" : "object",
          });
          return { text, update, isValid: false };
        }
      } catch (e) {
        console.error("[Coach] Parse error", {
          error: e instanceof Error ? e.message : String(e),
          jsonStr,
          stack: e instanceof Error ? e.stack : undefined,
        });
        return { text: content, update: null, isValid: false };
      }
    }
    console.log("[Coach] No update JSON found in response");
    return { text: content, update: null, isValid: true };
  };

  const getPreviewProfile = (update: any): UserProfile | null => {
    if (!profile || !update) return null;

    const updated = { ...profile };

    if (update.field === "bio" && update.action === "replace") {
      updated.bio = update.data.bio || update.data;
    } else if (update.field === "promptAnswers") {
      if (update.action === "replace" && Array.isArray(update.data)) {
        updated.promptAnswers = update.data.map((p: any, i: number) => ({
          id: `prompt-${i}`,
          promptId: p.promptId || `prompt-${i}`,
          promptText: p.promptText,
          answerText: p.answerText,
          source: "llm" as const,
          sortOrder: i,
        }));
      } else if (update.action === "add" && update.data) {
        const newPrompt = {
          id: `prompt-${updated.promptAnswers.length}`,
          promptId: update.data.promptId || `prompt-${updated.promptAnswers.length}`,
          promptText: update.data.promptText,
          answerText: update.data.answerText,
          source: "llm" as const,
          sortOrder: updated.promptAnswers.length,
        };
        updated.promptAnswers = [...updated.promptAnswers, newPrompt];
      }
    } else if (update.field === "funFacts") {
      if (update.action === "replace" && Array.isArray(update.data)) {
        updated.funFacts = update.data.map((f: any, i: number) => {
          const source: "llm" | "user" = f.source === "llm" || f.source === "user" ? f.source : "llm";
          return {
            id: f.id || `fact-${i}`,
            label: f.label,
            value: f.value,
            source,
            sortOrder: f.sortOrder ?? i,
          };
        });
      } else if (update.action === "add" && update.data) {
        const newFact = {
          id: `fact-${updated.funFacts.length}`,
          label: update.data.label,
          value: update.data.value,
          source: "llm" as const,
          sortOrder: updated.funFacts.length,
        };
        updated.funFacts = [...updated.funFacts, newFact];
      }
    }

    return updated;
  };

  const applyProfileUpdate = (update: any) => {
    const updatedProfile = getPreviewProfile(update);
    if (updatedProfile) {
      onProfileUpdate(updatedProfile);
      toast.success("Profile updated!");
      // Clear the profileUpdate from the last message
      setMessages((prev) => {
        return prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, profileUpdate: undefined } : m
        );
      });
    }
  };

  const declineProfileUpdate = () => {
    // Remove the profileUpdate from the last message
    setMessages((prev) => {
      return prev.map((m, i) =>
        i === prev.length - 1 ? { ...m, profileUpdate: undefined } : m
      );
    });
    toast.info("Changes declined");
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Immediately add a placeholder assistant message to show it's thinking
    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    let assistantContent = "";

    try {
      const systemPrompt = buildCoachSystemPrompt(profile, profile?.yellowcakeData);
      console.log("[Coach Frontend] Built systemPrompt length:", systemPrompt.length);
      console.log("[Coach Frontend] SystemPrompt contains BANANA:", systemPrompt.includes("BANANA"));
      if (systemPrompt.length < 500) {
        console.log("[Coach Frontend] SystemPrompt preview:", systemPrompt.substring(0, 500));
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt,
          currentProfile: profile,
          yellowcakeData: profile?.yellowcakeData,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        if (resp.status === 402) {
          throw new Error("API credits depleted.");
        }
        throw new Error("Failed to get response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === assistantId) {
            // Update the placeholder message we created earlier
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          // Fallback (shouldn't happen since we pre-created the message)
          return [
            ...prev,
            { id: assistantId, role: "assistant", content: assistantContent },
          ];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Parse final content for profile updates asynchronously
      // Use setTimeout to defer this work and prevent blocking
      setTimeout(() => {
        const { text, update, isValid } = parseProfileUpdate(assistantContent);

        // Update the final message with cleaned text and update status
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === assistantId) {
            // Include isValid flag to determine if we should show error UI
            return prev.map((m, i) =>
              i === prev.length - 1
                ? {
                    ...m,
                    content: text,
                    profileUpdate: update,
                    profileUpdateIsValid: isValid,
                  }
                : m
            );
          }
          return prev;
        });
      }, 0);

    } catch (error) {
      console.error("Coach chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const hasProfileUpdate = lastMessage?.role === "assistant" && lastMessage?.profileUpdate;
  const previewProfile = hasProfileUpdate ? getPreviewProfile(lastMessage.profileUpdate) : null;

  const renderPreview = () => {
    const hasUpdate = lastMessage?.profileUpdate !== undefined;
    const isValid = lastMessage?.profileUpdateIsValid !== false;

    if (!hasUpdate) return null;

    return (
      <ProfileUpdatePreview
        update={lastMessage.profileUpdate}
        previewProfile={previewProfile}
        isValid={isValid}
        onApply={() => applyProfileUpdate(lastMessage.profileUpdate)}
        onDecline={declineProfileUpdate}
      />
    );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
      {/* Scrollable container with header inside */}
      <div className="flex-1 overflow-y-auto px-2 pt-4">
        {/* Header Card - Scrolls away naturally */}
        <Card variant="elevated" className="mb-4">
          <div className="p-3 flex items-center gap-3">
            <IconCircle variant="match" size="md" className="shadow-md">
              <Sparkles className="w-5 h-5 text-match-foreground" />
            </IconCircle>
            <div>
              <h3 className="text-heading text-base font-semibold">Gemini Coach</h3>
              <p className="text-caption text-xs">Your Data-Driven Wingman</p>
            </div>
          </div>
        </Card>

        {/* Messages Area */}
        <div className="space-y-4 mb-4">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
            <TypingIndicator />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preview Changes with Apply/Decline */}
        {renderPreview()}
      </div>

      {/* Input - Fixed at bottom */}
      <div className="shrink-0 px-2">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
