import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface GeminiCoachProps {
  onProfileGenerated?: (bio: string, features: string[]) => void;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hey there! 👋 I'm your Data-Driven Wingman. I've analyzed your digital footprint and I'm ready to craft the perfect profile for you. First question: Who are you trying to attract? (e.g., 'Introverted gamers', 'Creative entrepreneurs', 'Outdoor adventurers')",
  },
];

export const GeminiCoach = ({ onProfileGenerated }: GeminiCoachProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Perfect! Based on your Letterboxd reviews and GitHub activity, I can see you have a thoughtful, introspective side. Let me craft something special...",
        "Love it! 🎯 I'm seeing some patterns in your data that would resonate perfectly with that audience. Your indie film taste + coding projects = unique combo!",
        "Here's what I've generated:\n\n**Bio:** \"Code by day, cinema by night. My Letterboxd is basically my love language. Looking for someone to debug life's edge cases with.\"\n\n**Highlighted Features:**\n• A24 film connoisseur\n• Open source contributor\n• Cozy coffee shop energy\n\nWhat do you think? Want me to adjust anything?",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
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
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
