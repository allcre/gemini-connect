import { useState, useEffect, useCallback } from "react";
import type { DiscoverProfile } from "@/types/profile";

const MESSAGES_KEY = "biomatch_messages";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// Generate a simple unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useLocalMessages = () => {
  const [conversations, setConversationsState] = useState<Conversation[]>([]);
  const [messages, setMessagesState] = useState<Record<string, Message[]>>({});

  const loadFromStorage = useCallback(() => {
    const storedMessages = localStorage.getItem(MESSAGES_KEY);
    if (storedMessages) {
      try {
        const data = JSON.parse(storedMessages);
        setMessagesState(data.messages || {});
        setConversationsState(data.conversations || []);
      } catch (e) {
        console.error("Failed to parse stored messages:", e);
      }
    }
  }, []);

  useEffect(() => {
    loadFromStorage();

    // Listen for storage events to sync across tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === MESSAGES_KEY) {
        loadFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadFromStorage]);

  // Save to localStorage
  const saveToStorage = useCallback((newMessages: Record<string, Message[]>, newConversations: Conversation[]) => {
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify({
        messages: newMessages,
        conversations: newConversations,
      }));
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  }, []);

  // Get or create conversation ID between two users
  const getConversationId = useCallback((userId1: string, userId2: string): string => {
    const sorted = [userId1, userId2].sort();
    return `conv_${sorted[0]}_${sorted[1]}`;
  }, []);

  // Start a new conversation or get existing one
  const startConversation = useCallback((otherUser: DiscoverProfile, currentUserId: string): string => {
    const conversationId = getConversationId(currentUserId, otherUser.id);

    // Check if conversation already exists in localStorage first
    const stored = localStorage.getItem(MESSAGES_KEY);
    let existingData: { messages?: Record<string, Message[]>; conversations?: Conversation[] } = {};
    if (stored) {
      try {
        existingData = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored messages:", e);
      }
    }

    const existingConversations = existingData.conversations || [];
    const existing = existingConversations.find(c => c.id === conversationId);

    if (existing) {
      // Update state to reflect existing conversation
      setConversationsState(existingConversations);
      setMessagesState(existingData.messages || {});
      return conversationId;
    }

    // Create new conversation - get first photo URL
    // Photos can be Photo objects { id, url, ... } or just strings
    let firstPhoto: string | undefined;
    if (otherUser.photos && otherUser.photos.length > 0) {
      const firstPhotoObj = otherUser.photos[0];
      if (typeof firstPhotoObj === 'string') {
        firstPhoto = firstPhotoObj;
      } else if (firstPhotoObj && typeof firstPhotoObj === 'object' && 'url' in firstPhotoObj) {
        firstPhoto = firstPhotoObj.url;
      }
    }

    const newConversation: Conversation = {
      id: conversationId,
      otherUserId: otherUser.id,
      otherUserName: otherUser.displayName,
      otherUserPhoto: firstPhoto,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    const updatedConversations = [newConversation, ...existingConversations];
    const updatedMessages = {
      ...(existingData.messages || {}),
      [conversationId]: existingData.messages?.[conversationId] || [],
    };

    // Save to localStorage FIRST (synchronously)
    saveToStorage(updatedMessages, updatedConversations);

    // Then update state
    setConversationsState(updatedConversations);
    setMessagesState(updatedMessages);

    return conversationId;
  }, [getConversationId, saveToStorage]);

  // Send a message
  const sendMessage = useCallback((
    conversationId: string,
    senderId: string,
    recipientId: string,
    content: string
  ) => {
    const message: Message = {
      id: generateId(),
      conversationId,
      senderId,
      recipientId,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessagesState((prev) => {
      const conversationMessages = prev[conversationId] || [];
      const updated = {
        ...prev,
        [conversationId]: [...conversationMessages, message],
      };

      setConversationsState((convs) => {
        const updatedConvs = convs.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        );

        // If conversation doesn't exist, create it
        if (!updatedConvs.find(c => c.id === conversationId)) {
          // This shouldn't happen, but handle it gracefully
          console.warn("Conversation not found for message:", conversationId);
        }

        saveToStorage(updated, updatedConvs);
        return updatedConvs;
      });

      return updated;
    });
  }, [saveToStorage]);

  // Get messages for a conversation
  const getMessages = useCallback((conversationId: string): Message[] => {
    return messages[conversationId] || [];
  }, [messages]);

  // Get conversation by ID
  const getConversation = useCallback((conversationId: string): Conversation | undefined => {
    return conversations.find(c => c.id === conversationId);
  }, [conversations]);

  return {
    conversations,
    messages,
    startConversation,
    sendMessage,
    getMessages,
    getConversation,
    reloadFromStorage: loadFromStorage,
  };
};
