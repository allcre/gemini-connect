import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { sendChatMessage, saveChatMessage, loadChatHistory } from "@/lib/geminiCoach";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface GeminiCoachProps {
  sessionId?: string;
  yellowcakeData?: Record<string, unknown>;
  onProfileGenerated?: (bio: string, features: string[]) => void;
}

const initialMessage: Message = {
  id: "1",
  role: "assistant",
  content: "Hey there! 👋 I'm your Data-Driven Wingman. I've analyzed your digital footprint and I'm ready to craft the perfect profile for you. First question: Who are you trying to attract? (e.g., 'Introverted gamers', 'Creative entrepreneurs', 'Outdoor adventurers')",
};

export const GeminiCoach = ({ sessionId = "default", yellowcakeData }: GeminiCoachProps) => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await loadChatHistory(sessionId);
        if (history.length > 0) {
          setMessages(history);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [sessionId]);

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

    // Save user message
    await saveChatMessage(sessionId, "user", input);

    try {
      // Prepare messages for API (exclude IDs)
      const apiMessages = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await sendChatMessage(apiMessages, yellowcakeData);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message
      await saveChatMessage(sessionId, "assistant", response);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🙏",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="flex items-center justify-center h-[500px] max-w-md mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

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
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isTyping}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};
