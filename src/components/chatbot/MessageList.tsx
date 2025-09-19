
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessage } from '@/types/chatbot';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userIsScrolling, setUserIsScrolling] = useState(false);
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback(() => {
    if (!userIsScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userIsScrolling]);

  // Handle scroll detection
  const handleScroll = useCallback(() => {
    setUserIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Reset user scrolling state after user stops scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setUserIsScrolling(false);
    }, 1500);
  }, []);

  // Check if typewriter is active by looking at loading state and recent messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // Typewriter is active if we have an AI message and it's recent (within last 2 seconds)
    const hasRecentAIMessage = lastMessage?.sender === 'ai' && 
      (Date.now() - new Date(lastMessage.timestamp).getTime()) < 10000;
    setIsTypewriterActive(hasRecentAIMessage || isLoading);
  }, [messages, isLoading]);

  // Auto-scroll when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ScrollArea 
      className="flex-1 p-4" 
      ref={scrollAreaRef}
      onScrollCapture={handleScroll}
    >
      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center min-h-[300px]">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-sm border border-white/10">
              <h3 className="text-white text-lg font-semibold mb-2">Welcome to Lavanya!</h3>
              <p className="text-white/70 text-sm">
                Ask me anything and I'll be happy to help you. How can I assist you today?
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
