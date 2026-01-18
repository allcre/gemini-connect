import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, Wand2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { UserProfile } from "@/types/profile";
import { getCoachWelcomeMessage, buildCoachSystemPrompt } from "@/prompts";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  profileUpdate?: any;
  profileUpdateIsValid?: boolean; // true if valid, false if invalid, undefined if no update
}

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
          if (last?.role === "assistant" && last.id.startsWith("streaming-")) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            { id: `streaming-${Date.now()}`, role: "assistant", content: assistantContent },
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

      // Parse final content for profile updates
      const { text, update, isValid } = parseProfileUpdate(assistantContent);

      // Update the final message with cleaned text and update status
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          // Include isValid flag to determine if we should show error UI
          return prev.map((m, i) =>
            i === prev.length - 1
              ? {
                  ...m,
                  id: Date.now().toString(),
                  content: text,
                  profileUpdate: update,
                  profileUpdateIsValid: isValid,
                }
              : m
          );
        }
        return prev;
      });

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

    // Show error message if update exists but is invalid
    if (hasUpdate && !isValid) {
      return (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-4 pb-2"
        >
          <Card className="p-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-sm font-semibold text-destructive">Formatting Issue</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    The coach tried to suggest changes, but there was a formatting issue. You can ask them to try again or rephrase your request.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }

    // Show normal preview for valid updates
    if (!previewProfile || !lastMessage?.profileUpdate) return null;

    const update = lastMessage.profileUpdate;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="px-4 pb-2 space-y-2"
      >
        <Card className="p-4 space-y-3 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="w-4 h-4" />
            Preview Changes
          </div>

          {update.field === "bio" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New Bio:</p>
              <p className="text-sm text-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-lg border border-border">
                {previewProfile.bio}
              </p>
            </div>
          )}

          {update.field === "promptAnswers" && update.action === "add" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New Prompt:</p>
              <div className="bg-background/50 p-3 rounded-lg border border-border space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{update.data.promptText}</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{update.data.answerText}</p>
              </div>
            </div>
          )}

          {update.field === "promptAnswers" && update.action === "replace" && (
            <div className="space-y-2">
              {Array.isArray(update.data) ? (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Updated Prompts ({update.data.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {update.data.map((prompt: any, i: number) => (
                      <div key={i} className="bg-background/50 p-3 rounded-lg border border-border space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{prompt.promptText}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{prompt.answerText}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <p className="text-xs font-medium text-destructive">
                    Invalid data format: Expected array for replace action
                  </p>
                </div>
              )}
            </div>
          )}

          {update.field === "funFacts" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New Fun Fact:</p>
              <div className="bg-background/50 p-3 rounded-lg border border-border">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{update.data.label}:</span> {update.data.value}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Apply/Decline Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => applyProfileUpdate(lastMessage.profileUpdate)}
            className="flex-1"
            size="lg"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
          <Button
            onClick={declineProfileUpdate}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Card variant="elevated" className="flex flex-col h-[500px] max-w-md mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 gradient-match rounded-full flex items-center justify-center shadow-soft">
          <Sparkles className="w-5 h-5 text-match-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Gemini Coach</h3>
          <p className="text-xs text-muted-foreground">Your Data-Driven Wingman</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === "assistant"
                    ? "gradient-match"
                    : "gradient-primary"
                }`}
              >
                {message.role === "assistant" ? (
                  <Bot className="w-4 h-4 text-match-foreground" />
                ) : (
                  <User className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === "assistant"
                    ? "bg-secondary text-secondary-foreground rounded-tl-sm"
                    : "gradient-primary text-primary-foreground rounded-tr-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 gradient-match rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-match-foreground" />
            </div>
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preview Changes with Apply/Decline */}
      {renderPreview()}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ask me to tweak your profile..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
