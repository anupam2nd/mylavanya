
import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chatbot';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-sm border border-white/10">
            <h3 className="text-white text-lg font-semibold mb-2">Welcome to AI Chat!</h3>
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
  );
}
