import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconCircle } from "@/components/ui/icon-circle";
import { ChatInput } from "@/components/coach/ChatInput";
import { useLocalMessages } from "@/hooks/useLocalMessages";
import { useLocalProfile } from "@/hooks/useLocalProfile";

interface MessagesProps {
  initialConversationId?: string | null;
  onConversationChange?: (conversationId: string | null) => void;
}

export const Messages = ({ initialConversationId = null, onConversationChange }: MessagesProps) => {
  const { profile } = useLocalProfile();
  const { conversations, messages, getMessages, sendMessage, reloadFromStorage } = useLocalMessages();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversationId, messages]);

  // Reload conversations when component mounts and when tab is visible
  useEffect(() => {
    // Initial load
    reloadFromStorage();

    // Also check localStorage directly
    const checkStorage = () => {
      const stored = localStorage.getItem("biomatch_messages");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const convs = data.conversations || [];
          if (convs.length > 0) {
            reloadFromStorage();
          }
        } catch (e) {
          console.error("Failed to parse stored messages:", e);
        }
      }
    };

    checkStorage();
    setHasLoaded(true);

    // Set up interval to check for new conversations
    const interval = setInterval(checkStorage, 500);

    return () => clearInterval(interval);
  }, []); // Only on mount

  // When initialConversationId is provided, check localStorage and open the conversation
  useEffect(() => {
    if (initialConversationId) {
      // Check localStorage directly first (bypassing state)
      const stored = localStorage.getItem("biomatch_messages");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const convs = data.conversations || [];
          const exists = convs.some((c: any) => c.id === initialConversationId);
          if (exists) {
            // Conversation exists - reload state and open it immediately
            reloadFromStorage();
            setSelectedConversationId(initialConversationId);
            return;
          }
        } catch (e) {
          console.error("Failed to check localStorage:", e);
        }
      }

      // If not found yet, reload anyway - conversation might have just been created
      reloadFromStorage();
    } else if (initialConversationId === null) {
      // Clear selection when initialConversationId is explicitly null
      setSelectedConversationId(null);
    }
  }, [initialConversationId, reloadFromStorage]);

  // Also check conversations array once it's loaded (as a fallback)
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversationExists = conversations.some(c => c.id === initialConversationId);
      if (conversationExists && selectedConversationId !== initialConversationId) {
        setSelectedConversationId(initialConversationId);
      }
    }
  }, [initialConversationId, conversations, selectedConversationId]);

  const selectedConversation = selectedConversationId
    ? conversations.find(c => c.id === selectedConversationId)
    : null;

  const conversationMessages = selectedConversationId
    ? getMessages(selectedConversationId)
    : [];

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId || !profile) return;

    // Find the other user ID from the conversation
    const otherUserId = selectedConversation?.otherUserId;
    if (!otherUserId) return;

    sendMessage(
      selectedConversationId,
      profile.id,
      otherUserId,
      messageInput.trim()
    );

    setMessageInput("");
  };

  // Chat view when conversation is selected
  if (selectedConversationId && selectedConversation) {
    return (
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
        {/* Scrollable container with header inside */}
        <div className="flex-1 overflow-y-auto px-2">
          {/* Header Card - Scrolls away naturally */}
          <Card variant="elevated" className="mb-4">
            <div className="p-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedConversationId(null);
                  onConversationChange?.(null);
                }}
                className="shrink-0 -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={selectedConversation.otherUserPhoto} className="object-cover" />
                <AvatarFallback>
                  {selectedConversation.otherUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-heading text-base font-semibold truncate">
                  {selectedConversation.otherUserName}
                </h3>
                <p className="text-caption text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
          </Card>

          {/* Messages Area */}
          <div className="space-y-4 mb-4">
            {conversationMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-body">No messages yet</p>
                <p className="text-caption mt-2">Start the conversation!</p>
              </div>
            ) : (
              <AnimatePresence>
                {conversationMessages.map((message) => {
                  const isMe = message.senderId === profile?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      <IconCircle
                        variant={isMe ? "primary" : "secondary"}
                        size="sm"
                      >
                        {isMe ? (
                          <User className="w-4 h-4 text-primary-foreground" />
                        ) : (
                          <User className="w-4 h-4 text-secondary-foreground" />
                        )}
                      </IconCircle>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          isMe
                            ? "gradient-primary text-primary-foreground rounded-tr-sm"
                            : "bg-secondary text-secondary-foreground rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-[10px] mt-1.5 ${
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input - Fixed at bottom */}
        <div className="shrink-0">
          <ChatInput
            value={messageInput}
            onChange={setMessageInput}
            onSubmit={handleSendMessage}
            isLoading={false}
            placeholder="Type a message..."
          />
        </div>
      </div>
    );
  }

  // Conversation list - show when no conversation is selected
  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto px-2">
        <Card variant="elevated" className="mb-4">
          <div className="p-3">
            <h2 className="text-heading text-base font-semibold">Messages</h2>
          </div>
        </Card>

        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center text-muted-foreground">
            <IconCircle variant="primary" size="xl" className="mb-6">
              <MessageCircle className="w-12 h-12" />
            </IconCircle>
            <h3 className="font-heading text-xl font-semibold mb-2">No conversations yet</h3>
            <p className="text-body">Start messaging someone from Discover!</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  variant="elevated"
                  className="p-4 cursor-pointer hover:bg-background transition-colors"
                  onClick={() => {
                    setSelectedConversationId(conversation.id);
                    onConversationChange?.(conversation.id);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarImage src={conversation.otherUserPhoto} className="object-cover" />
                      <AvatarFallback>
                        {conversation.otherUserName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-heading font-semibold text-foreground truncate">
                          {conversation.otherUserName}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage ? (
                        <p className="text-caption text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-caption text-muted-foreground italic">
                          Start a conversation
                        </p>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
