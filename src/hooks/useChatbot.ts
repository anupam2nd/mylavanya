
import { useState, useCallback } from 'react';
import { ChatMessage, ChatbotState } from '@/types/chatbot';
import { toast } from 'sonner';

const API_ENDPOINT = 'https://n8n.stepzbasic.xyz/webhook/70a3b0d0-28aa-4787-9087-33d299b5c049';

export function useChatbot() {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    isOpen: false,
    error: null,
  });

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: generateId(),
        content: data.response || 'Sorry, I could not process your request.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));

    } catch (error) {
      console.error('Chatbot API error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response from AI. Please try again.',
      }));
      
      toast.error('Failed to send message. Please try again.');
    }
  }, []);

  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  return {
    ...state,
    sendMessage,
    toggleChat,
    clearError,
    clearMessages,
  };
}
