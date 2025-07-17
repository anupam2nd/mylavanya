
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatbotState } from '@/types/chatbot';
import { useCustomToast } from '@/context/ToastContext';

const API_ENDPOINT = 'https://n8n.stepzbasic.xyz/webhook/70a3b0d0-28aa-4787-9087-33d299b5c049';

export function useChatbot() {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    isOpen: false,
    error: null,
    hasNewMessage: false,
  });
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { showToast } = useCustomToast();

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create a simple notification beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported or failed:', error);
    }
  }, []);

  // Show welcome message after 5 seconds
  useEffect(() => {
    if (!hasShownWelcome) {
      const timer = setTimeout(() => {
        playNotificationSound();
        setHasShownWelcome(true);
        
        // Just set hasNewMessage to true to show tooltip-like behavior
        setState(prev => ({
          ...prev,
          hasNewMessage: true,
        }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasShownWelcome, playNotificationSound]);

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
      
      // Check if response is empty, null, or contains no meaningful data
      const responseText = data.response || '';
      const isEmptyResponse = !responseText || 
                              responseText.trim() === '' || 
                              responseText.toLowerCase().includes('no data') ||
                              responseText.toLowerCase().includes('not found') ||
                              responseText.toLowerCase().includes('unable to find');
      
      let aiResponseContent;
      if (isEmptyResponse) {
        aiResponseContent = "I'm unable to process your request at the moment. For immediate assistance, please contact us at +91 9230967221. Our team will be happy to help you with your query.";
      } else {
        aiResponseContent = responseText;
      }
      
      const aiMessage: ChatMessage = {
        id: generateId(),
        content: aiResponseContent,
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
      
      const fallbackMessage: ChatMessage = {
        id: generateId(),
        content: "I'm unable to process your request at the moment. For immediate assistance, please contact us at +91 9230967221. Our team will be happy to help you with your query.",
        sender: 'ai',
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, fallbackMessage],
        isLoading: false,
        error: null, // Clear error since we're showing a fallback message
      }));
      
      showToast('❌ Connection issue. Please try again or contact support.', 'error', 4000);
    }
  }, [showToast]);

  const toggleChat = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isOpen: !prev.isOpen,
      hasNewMessage: false // Clear notification when opening chat
    }));
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
