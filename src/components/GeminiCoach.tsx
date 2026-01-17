import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserProfile, PromptAnswer } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface GeminiCoachProps {
  profile: UserProfile;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
}

const getInitialMessage = (profile: UserProfile): Message => ({
  id: "1",
  role: "assistant",
  content: `Hey ${profile.displayName || "there"}! 👋 I'm your Data-Driven Wingman. I've seen your profile and I think it's looking great! 

Here's what I can help you with:
• Tweak your bio to attract a different audience
• Generate new prompt answers
• Make your profile more witty/serious/playful
• Highlight different aspects of your data

Just tell me what you'd like to change!`,
});

export const GeminiCoach = ({ profile, onProfileUpdate }: GeminiCoachProps) => {
  const [messages, setMessages] = useState<Message[]>([getInitialMessage(profile)]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-profile", {
        body: {
          type: "update-profile",
          userInfo: {
            displayName: profile.displayName,
            targetAudience: profile.targetAudience,
          },
          yellowcakeData: profile.yellowcakeData,
          existingProfile: {
            bio: profile.bio,
            promptAnswers: profile.promptAnswers.map(p => ({
              promptText: p.promptText,
              answerText: p.answerText,
            })),
          },
          chatMessage: input,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Apply updates to profile
      const updates: Partial<UserProfile> = {};
      
      if (data.bio && data.bio !== profile.bio) {
        updates.bio = data.bio;
      }
      
      if (data.promptAnswers && Array.isArray(data.promptAnswers)) {
        const newPromptAnswers: PromptAnswer[] = data.promptAnswers.map(
          (p: { promptId: string; promptText: string; answerText: string }, i: number) => ({
            id: crypto.randomUUID(),
            promptId: p.promptId,
            promptText: p.promptText,
            answerText: p.answerText,
            source: "llm" as const,
            sortOrder: (i + 1) * 10 + 5,
          })
        );
        updates.promptAnswers = newPromptAnswers;
      }

      if (Object.keys(updates).length > 0) {
        onProfileUpdate(updates);
      }

      // Generate assistant response
      const changesSummary = [];
      if (updates.bio) changesSummary.push("updated your bio");
      if (updates.promptAnswers) changesSummary.push("refreshed your prompts");

      const assistantContent = changesSummary.length > 0
        ? `Done! I've ${changesSummary.join(" and ")}. Check out your profile to see the changes! 

Anything else you'd like me to tweak?`
        : `I've reviewed your profile based on your request. Let me know if you'd like any specific changes!`;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Coach error:", err);
      toast({
        title: "Oops!",
        description: "Couldn't process your request. Try again?",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I hit a snag there! 😅 Could you try asking again?",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card variant="elevated" className="flex flex-col h-[500px] max-w-md mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 gradient-match rounded-full flex items-center justify-center shadow-soft">
          <Sparkles className="w-5 h-5 text-match-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Gemini Coach</h3>
          <p className="text-xs text-muted-foreground">Your Data-Driven Wingman</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMessages([getInitialMessage(profile)])}
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
                className={`max-w-[80%] p-4 rounded-2xl ${
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

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 gradient-match rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-match-foreground" />
            </div>
            <div className="bg-secondary p-4 rounded-2xl rounded-tl-sm">
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
            placeholder="Ask me to update your profile..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
